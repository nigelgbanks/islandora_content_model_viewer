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
    loadEditPermissionContent: function () {
      this.loadContent(ContentModelViewer.properties.url.object.permission_form(this.pid));
    },
    loadEditMetadataContent: function (form_selector, success) {
      var params = {};
      $('select, input', $(form_selector)).each(function() {
        var name = $(this).attr('name');
        if(name.length > 0) {
          params[name] = $(this).attr('value');
        }
      });
      this.loadContent(ContentModelViewer.properties.url.object.metadata_form(this.pid), params, success);
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
