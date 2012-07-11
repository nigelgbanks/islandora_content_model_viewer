


Ext.onReady(function(){
  Ext.define('ContentModelViewer.widgets.OverviewPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.overviewpanel',
    config: {
      pid: 'required'
    },
    constructor: function(config) {
      this.callParent(arguments);
      this.pid = config.pid;
      this.deparam = this.createParamDeserializer();
      this.add(this.createContent(ContentModelViewer.properties.url.object.overview(config.pid)));
      var files = Ext.create('ContentModelViewer.widgets.FilesPanel', {
        region: 'east',
        pid: config.pid
      });
      this.add(files);
    },
    createContent: function(url) {
      var loaded = new Array();
      return Ext.create('Ext.panel.Panel', {
        html: '<div>Loading...</div>',
        itemId: 'content',
        autoScroll: true,
        region: 'center',
        loader: {
          url: url,
          renderer: function(loader, response, active) {
            var json = Ext.JSON.decode(response.responseText);
            loader.getTarget().update(json.data); // Update Panel
            if(json.css.length > 0) {
              for(var i = 0; i < json.css.length; i++) {
                var file = json.css[i];
                if($('head > link[href="' + file + '"]').length == 0 && $.inArray(file, loaded) < 0) {
                  loaded.push(file);
                  $("head").append("<link rel='stylesheet' type='text/css' href='" + file +"' />");
                }
              }
            }
            if(json.js.length > 0) { // Load new JS files
              $.ajaxSetup({async:false});
              for(var i = 0; i < json.js.length; i++) {
                var file = json.js[i];
                if($('head > script[src="' + file + '"]').length == 0 && $.inArray(file, loaded) < 0) {
                  loaded.push(file);
                  $.getScript(file);
                }
              }
              $.ajaxSetup({async:true});
            }
            if(json.settings !== null) { // Update settings.
              jQuery.extend(Drupal.settings, json.settings);
              Drupal.attachBehaviors();
            }
            if(json.func) {
              eval(json.func)(); // Execute custom function
            }
            return true;
          },
          autoLoad: true
        }
      });
    },
    // Yanked from https://github.com/jupiterjs/jquerymx/blob/master/lang/string/deparam/deparam.js
    createParamDeserializer: function() {
      var digitTest = /^\d+$/,
		  keyBreaker = /([^\[\]]+)|(\[\])/g,
		  plus = /\+/g,
		  paramTest = /([^?#]*)(#.*)?$/;
		  return function(params){
			  if(! params || ! paramTest.test(params) ) {
				  return {};
			  }
			  var data = {},
				pairs = params.split('&'),
				current;
			  for(var i=0; i < pairs.length; i++){
				  current = data;
				  var pair = pairs[i].split('=');
				  // if we find foo=1+1=2
				  if(pair.length != 2) {
					  pair = [pair[0], pair.slice(1).join("=")]
				  }
          var key = decodeURIComponent(pair[0].replace(plus, " ")),
          value = decodeURIComponent(pair[1].replace(plus, " ")),
					parts = key.match(keyBreaker);
				  for ( var j = 0; j < parts.length - 1; j++ ) {
					  var part = parts[j];
					  if (!current[part] ) {
						  // if what we are pointing to looks like an array
						  current[part] = digitTest.test(parts[j+1]) || parts[j+1] == "[]" ? [] : {}
					  }
					  current = current[part];
				  }
				  lastPart = parts[parts.length - 1];
				  if(lastPart == "[]") {
					  current.push(value)
				  } else{
					  current[lastPart] = value;
				  }
			  }
			  return data;
		  }
	  },
    loadContent: function (url, params, success) {
      var loader = this.getComponent('content').getLoader();
      loader.clearListeners();
      if(success) {
        loader.addListener('load', success);
      }
      loader.load({
        url: url,
        params: params
      });
    },
    getFormParams: function (form_selector) {
      var params = {};
      var form = $(form_selector);
      if(form.length) {
        var serialized_form = form.serialize().replace(/\+/g, '%20');
        var values = serialized_form.split('&');
        for(i = 0; i < values.length; i++) {
          var key_value_pair =  values[i].split('=');
          var key = decodeURIComponent(key_value_pair[0]);
          var value = decodeURIComponent(key_value_pair[1]);
          if(params[key] === undefined) {
            params[key] = value;
          }
          else if (typeof params[key] === 'string') {
            params[key] = [params[key], value];
          }
          else {
            params[key].push(value);
          }
        }
      }
      console.log(params);
      return params;
    },
    loadEditPermissionContent: function (form_selector) {
      this.loadContent(ContentModelViewer.properties.url.object.permission_form(this.pid), this.getFormParams(form_selector));
    },
    loadEditMetadataContent: function (form_selector, success) {
      this.loadContent(ContentModelViewer.properties.url.object.metadata_form(this.pid), this.getFormParams(form_selector), success);
    },
    setPid: function(pid) {
      this.pid = pid;
      this.refresh();
    },
    refresh: function() {
      this.getComponent('files').setPid(this.pid);
      this.loadContent(ContentModelViewer.properties.url.object.overview(this.pid));
    },
    itemId: 'overview',
    title: 'Overview',
    layout: {
      type: 'border'
    }
  });
});
