/***

This is a wrapper object for connecting cow to eagle.

***/


var CowWrapper = function(){
		//singleton
		var wrapper = window.cowwrapper || {};
		
		function nopasaran(){
			console.log('You can\'t set this');
		}
		
		Object.defineProperty(wrapper, 'projects', {
				get: function(){
					return this.core.projects().filter(function(d){
							return !d.deleted();
					});
				},
				set: nopasaran
		});
		
		Object.defineProperty(wrapper, 'activeproject', {
				get: function(){
					return this.core.project();
				},
				set:function(project){
					this.core.project(project.id());
				}
		});
		
		Object.defineProperty(wrapper, 'users', {
				get: function(){
					return this.core.users().filter(function(d){
							return !d.deleted();
					});
				},
				set: nopasaran
		});
		
		Object.defineProperty(wrapper, 'features', {
				get: function(){
					return this.core.project().filter(function(d){
							return !d.deleted() 
								&& d.data('type') == 'feature';
					});
				},
				set: nopasaran
				
		}
		function connect(){
			
		}
		wrapper.connect = connect;
		
		window.cowwrapper = wrapper;			
					
})();