var lodui = lodui || {};

lodui.queries = function(){
	this.sparqlEndpoint = 'http://lod.geodan.nl/sparql?format="text/csv"&query=';
};

lodui.queries.prototype.getAvgGasUse = function(){
	var query = 'prefix ebif: <http://lod.geodan.nl/vocab/ebif#> \
		prefix locn: <http://www.w3.org/ns/locn#> \
		select ?time (avg(?waarde) as ?value) \
		from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
		where { \
			?meter a ebif:GasMeter . \
			?meting a ebif:Measurement . \
			?meting ebif:meter ?meter . \
			?meting ebif:time ?time . \
			?meting ebif:measuredValue ?waarde . \
			filter (xsd:dateTime(?time) >= xsd:dateTime("2013-01-01T00:00:00") &&xsd:dateTime(?time) < xsd:dateTime("2013-12-31T00:00:00")) \
		} \
		group by ?time \
		order by ?time';
		return query;
}

lodui.queries.prototype.getGasMeters = function(postcode){
	var query = 'prefix ebif: <http://lod.geodan.nl/vocab/ebif#> \
		prefix locn: <http://www.w3.org/ns/locn#> \
		prefix bag: <http://lod.geodan.nl/vocab/bag#> \
		select ?meter ?woonplaats ?straat ?nummer ?letter ?postcode \
		from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
		where { \
            ?meter a ebif:GasMeter . \
            ?meter locn:address ?adres . \
            ?adres locn:postName ?woonplaats . \
            ?adres locn:thoroughfare ?straat . \
            ?adres locn:postCode ?postcode . \
            ?adres bag:huisnummer ?nummer . \
            optional {?adres bag:huisletter ?letter .} \
            FILTER regex(?postcode, "'+postcode+'","i") . \
		} \
		order by ?woonplaats ?straat ?nummer \
		LIMIT 20';
		var request_url = encodeURI(this.sparqlEndpoint) + encodeURIComponent(query);
		//return request_url;
		return query;
}
lodui.queries.prototype.getMeterValues = function(meter){
	var query = 'prefix ebif:<http://lod.geodan.nl/vocab/ebif#>\
		select ?time ?value \
		from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
		where { \
		    ?meting a ebif:Measurement . \
		    ?meting ebif:meter <'+meter+'> . \
		    ?meting ebif:time ?time . \
		    ?meting ebif:measuredValue ?value . \
		    filter (xsd:dateTime(?time) >= xsd:dateTime("2013-01-01T00:00:00") && xsd:dateTime(?time) < xsd:dateTime("2013-12-31T00:00:00"))\
		} \
		order by ?time';
	var request_url = encodeURI(this.sparqlEndpoint) + encodeURIComponent(query);
	//return request_url;
	return query;
}
lodui.queries.prototype.geteMeterValues = function(meter){
	var query = 'prefix ebif: <http://lod.geodan.nl/vocab/ebif#> \
        select distinct?time bif:either(min(?value) > 0,0,min(?value)) as ?teruglevering (max(?value) as ?levering) \
        from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
        where { \
            ?meting a ebif:Measurement . \
            ?meting ebif:meter <'+meter+'> . \
            ?meting ebif:time ?time . \
            ?meting ebif:measuredValue ?value . \
            filter (xsd:dateTime(?time) >= xsd:dateTime("2013-02-01T00:00:00") && xsd:dateTime(?time) < xsd:dateTime("2013-03-31T00:00:00"))\
        } \
        group by ?time \
        order by ?time \
        ';
    var request_url = encodeURI(this.sparqlEndpoint) + encodeURIComponent(query);
	//return request_url;
	return query;
}

lodui.queries.prototype.geocodedMeters = function(){
	var query = 'prefix bag: <http://lod.geodan.nl/vocab/bag#> \
        prefix ebif: <http://lod.geodan.nl/vocab/ebif#>  \
        prefix locn: <http://www.w3.org/ns/locn#> \
        select ?meter ?woonplaats ?straat ?nummer ?letter ?postcode ?oppervlakte ?gebruiksdoel ?geom \
        from <http://lod.geodan.nl/basisreg/bag/verblijfsobject/> \
        from <http://lod.geodan.nl/basisreg/bag/nummeraanduiding/> \
        from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
        where { \
            { \
                graph <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> { \
                    ?meter a ebif:Meter . \
                    ?meter locn:address ?adres . \
                    ?adres locn:postCode ?postcode . \
                    ?adres bag:huisnummer ?nummer . \
                    ?adres locn:postName ?woonplaats . \
                    ?adres locn:thoroughfare ?straat . \
                    optional {?adres bag:huisletter ?letter .} \
                    filter (bound(?letter)) . \
                } \
                graph <http://lod.geodan.nl/basisreg/bag/nummeraanduiding/> { \
                    ?NumAandMut a bag:Nummeraanduidingmutatie . \
                    ?NumAandMut bag:lastKnown "true"^^xsd:boolean . \
                    ?NumAandMut bag:postcode ?postcode . \
                    ?NumAandMut bag:huisletter ?letter . \
                    ?NumAandMut bag:huisnummer ?nummer . \
                    ?NumAandMut bag:nummeraanduiding ?NumAand . \
                } \
                graph <http://lod.geodan.nl/basisreg/bag/verblijfsobject/> { \
                    ?VobjMut a bag:Verblijfsobjectmutatie . \
                    ?VobjMut bag:lastKnown "true"^^xsd:boolean . \
                    ?VobjMut bag:hoofdadres ?NumAand . \
                    ?VobjMut bag:oppervlakte ?oppervlakte . \
                    ?VobjMut bag:gebruiksdoel ?gebruiksdoel . \
                    ?VobjMut bag:geometrie ?geom \
                } \
            } union { \
                graph <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> { \
                    ?meter a ebif:Meter . \
                    ?meter locn:address ?adres . \
                    ?adres locn:postCode ?postcode . \
                    ?adres bag:huisnummer ?nummer . \
                    ?adres locn:postName ?woonplaats . \
                    ?adres locn:thoroughfare ?straat . \
                    optional {?adres bag:huisletter ?letter} . \
                    filter (!bound(?letter)) . \
                } \
                graph <http://lod.geodan.nl/basisreg/bag/nummeraanduiding/> { \
                    ?NumAandMut a bag:Nummeraanduidingmutatie . \
                    ?NumAandMut bag:lastKnown "true"^^xsd:boolean . \
                    ?NumAandMut bag:postcode ?postcode . \
                    ?NumAandMut bag:huisnummer ?nummer . \
                    ?NumAandMut bag:nummeraanduiding ?NumAand . \
                } \
                graph <http://lod.geodan.nl/basisreg/bag/verblijfsobject/> { \
                    ?VobjMut a bag:Verblijfsobjectmutatie . \
                    ?VobjMut bag:lastKnown "true"^^xsd:boolean . \
                    ?VobjMut bag:hoofdadres ?NumAand . \
                    ?VobjMut bag:oppervlakte ?oppervlakte . \
                    ?VobjMut bag:gebruiksdoel ?gebruiksdoel . \
                    ?VobjMut bag:geometrie ?geom  \
                } \
            } \
        } \
        order by ?meter';
    var request_url = encodeURI(this.sparqlEndpoint) + encodeURIComponent(query);
    //return request_url;
	return query;
}
lodui.queries.prototype.getAvgGaspPostcode = function(){
	return 'prefix ebif: <http://lod.geodan.nl/vocab/ebif#> \
	prefix locn: <http://www.w3.org/ns/locn#> \
	select ?tijd ?pc4 (avg(?waarde) as ?gemiddelde_waarde) \
	from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
	where { \
		?meter a ebif:GasMeter . \
		?meter locn:address ?adres . \
		?adres locn:postCode ?postcode . \
		?meting a ebif:Measurement . \
		?meting ebif:meter ?meter . \
		?meting ebif:time ?tijd . \
		?meting ebif:measuredValue ?waarde . \
		filter (xsd:dateTime(?tijd) >= xsd:dateTime("2013-10-01T00:00:00") &&xsd:dateTime(?tijd) < xsd:dateTime("2013-10-02T00:00:00")) \
		bind(substr(?postcode,1,4) as ?pc4) \
	} \
	group by ?tijd ?pc4 \
	order by ?tijd \
	';
}

lodui.queries.prototype.allMeters = function(postcode,metertype){
	return '\
	prefix ebif: <http://lod.geodan.nl/vocab/ebif#> \
	prefix locn: <http://www.w3.org/ns/locn#> \
	construct { \
	 ?meter a ?type . \
	 ?meter locn:address ?adres . \
	 ?adres ?p_adres ?o_adres . \
	} \
	from <http://lod.geodan.nl/cerisesg/ebif/julianadorp/> \
	where { \
	 ?meter a ?type . \
	 ?meter a ebif:'+metertype+' . \
	 ?meter locn:address ?adres . \
	 ?adres ?p_adres ?o_adres . \
	 ?adres locn:postCode ?postcode \
	 filter regex(?postcode, "'+postcode+'+?") \
	} \
';
};
//	 ?adres locn:postCode "'+postcode+'"^^xsd:string. \

lodui.queries.prototype.findBag = function(item){
	return 'prefix bag: <http://lod.geodan.nl/vocab/bag#> \
		construct { \
 			?adresseerbaarobjectmut bag:geometrie ?geometrie . \
 			?adresseerbaarobjectmut bag:oppervlakte ?oppervlakte . \
 			?adresseerbaarobjectmut bag:gebruiksdoel ?gebruiksdoel . \
 		} \
		where { \
			?numaandmut a bag:Nummeraanduidingmutatie . \
			?numaandmut bag:openbareRuimte ?openbareruimte . \
			?numaandmut bag:nummeraanduiding ?nummeraanduiding . \
			?numaandmut bag:postcode "'+item.postcode+'"^^xsd:string . \
			?numaandmut bag:postcode ?postcode . \
			?numaandmut bag:huisnummer "'+item.nummer+'"^^xsd:integer . \
			?numaandmut bag:huisnummer ?huisnummer . \
			?adresseerbaarobjectmut a bag:Adresseerbaarobjectmutatie . \
			?adresseerbaarobjectmut bag:hoofdadres ?nummeraanduiding . \
			?adresseerbaarobjectmut bag:oppervlakte ?oppervlakte . \
			?adresseerbaarobjectmut bag:gebruiksdoel ?gebruiksdoel . \
			?adresseerbaarobjectmut bag:verblijfsobjectstatus ?status . \
			?adresseerbaarobjectmut bag:geometrie ?geometrie . \
		}';
};
var queries = new lodui.queries();