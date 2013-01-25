/**
 * Create Namespaces
 */
Ext.ns('ContentModelViewer');
Ext.ns('ContentModelViewer.setup');
Ext.ns('ContentModelViewer.properties');
Ext.ns('ContentModelViewer.functions');
Ext.ns('ContentModelViewer.models');
Ext.ns('ContentModelViewer.widgets');

/**
 * Removes islandora generated HTML and replaces it with the required Content Model viewer HTML.
 */
ContentModelViewer.setup.initContentArea = function() {
  var parent = $('#tabs-tabset').parent();
  if(parent.length) {
    var content_model_viewer = $('#content-model-viewer');
    var content = content_model_viewer.remove();
    parent.empty();
    parent.append(content);
  }
}
/**
 * Initialize ExtJS features.
 */
ContentModelViewer.setup.initExtJSFeatures = function() {
  var expirationDateTime = new Date().getTime()+(1000*60*60*24*7); // 7 days from now
  Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider', {
    expires: new Date(expirationDateTime)
  }));
  Ext.QuickTips.init();
}
/**
 * Set up events on global objects such as the window or document.
 */
ContentModelViewer.setup.setUpGlobalEvents = function() {
  if ( 'onhashchange' in window ) {
    window.onhashchange = function() {
      var token = window.location.hash.substr(1);
      var tabpanel = Ext.getCmp('cmvtabpanel');
      if (token && tabpanel.isVisible(token)) {
        tabpanel.setActiveTab(token);
      }
    }
  }
}
/**
 * Set up events on global objects such as the window or document.
 */
ContentModelViewer.setup.navigateToObject = function() {
  var functions = ContentModelViewer.functions;
  var properties = ContentModelViewer.properties;
  if(properties.pid !== "") {
    if(properties.isCollection) {
      functions.selectConcept(properties.pid);
    }
    else {
      functions.selectResource(properties.pid);
    }
  }
}

/**
 * Set up the properties for the Content Model Viewer
 */
ContentModelViewer.setup.initProperties = function() {
  // Local Variables
  var properties = ContentModelViewer.properties;
  /**
   * Create a function for generating a url from a store url and a pid.
   */
  var url_replace_pid_func = function(id) {
    var url = $(id).text();
    return function(pid) {
      var temp = url;
      return temp.replace('/pid/', '/'+pid+'/');
    }
  };
  /**
   * Create a function for generating a url from a store url and a pid/dsid.
   */
  var url_replace_pid_dsid_func = function(id) {
    var url = $(id).text();
    return function(pid, dsid) {
      var temp = url;
      temp = temp.replace('/pid', '/'+pid);
      return temp.replace('/dsid', '/'+dsid);
    }
  };
  // Set properties @todo get collection/focused from URL # if possible.
  properties.rootowner = $('#rootowner').text();
  properties.siUser = $('#si_user').text();
  properties.root = $('#root').text();
  properties.pid = $('#pid').text();
  properties.pids = {
    collection: undefined,
    concept: undefined,
    resource: undefined,
    focused: undefined
  }
  properties.dsid = $('#dsid').text();
  properties.viewFunction = $('#view_function').text();
  properties.isCollection = $('#is_collection').text() == 'true' ? true : false;
  properties.url = { // Functions to generate AJAX Callback URL
    object: {
      overview: url_replace_pid_func('#object_overview_url'),
      properties: url_replace_pid_func('#object_properties_url'),
      datastreams: url_replace_pid_func('#object_datastreams_url'),
      permission_form: url_replace_pid_func('#object_permission_form_url'),
      metadata_form: url_replace_pid_func('#object_metadata_form_url'),
      members: url_replace_pid_func('#object_members_url'),
      treemembers: url_replace_pid_func('#object_treemembers_url'),
      treemember: url_replace_pid_func('#object_treemember_url'),
      remove_relationship: url_replace_pid_dsid_func('#object_remove_relationship_url'),
      add: url_replace_pid_dsid_func('#object_add_url'),
      purge: url_replace_pid_func('#object_purge_url')
    },
    datastream: {
      add: url_replace_pid_func('#datastream_add_url'),
      purge: url_replace_pid_dsid_func('#datastream_purge_url'),
      properties: url_replace_pid_dsid_func('#datastream_properties_url'),
      download: url_replace_pid_dsid_func('#datastream_download_url'),
      view: url_replace_pid_dsid_func('#datastream_view_url')
    }
  };
}
/**
 * Defines functions to be used by the Content Model Viewer.
 */
ContentModelViewer.setup.defineFunctions = function() {
  var properties = ContentModelViewer.properties;
  var url = properties.url;
  ContentModelViewer.functions = {
    /**
     * Download Datastream using hidden html form that is rendered with the Viewer.tpl.php
     */
    downloadDatastream: function(pid, dsid) {
      var form = Ext.get("datastream-download-form");
      form.set({
        action: url.datastream.download(pid, dsid)
      });
      document.forms["datastream-download-form"].submit();
    },
    // Shows a Collection, triggered by selecting a parent in the concept/resource overview, or by selecting a item in the treepanel. Can't hide a collection.
    selectConcept: function(pid, closeResourceTab) {
      closeResourceTab = (closeResourceTab == undefined) ? true : closeResourceTab;
      properties.pids.concept = pid || properties.pids.concept;
      if(closeResourceTab) { // Don't need to hide the resource if the concept was selected from the resource overview panel
        this.closeResource();
      }
      this.loadConcept(pid);
      this.loadResources(pid);
      this.loadViewer(pid);
      this.loadManage(pid);
      this.showConcept();
    },
    // The user has selected a resource.
    selectResource: function(pid) {
      properties.pids.resource = pid;
      this.loadResource();
      this.loadViewer(pid);
      this.loadManage(pid);
      this.showResource();
      // TODO handle the auto focus of viewer if possible or resource overview if not.
    },
    // Shows the concept in its overview panel, creates the panel if it doesn't already exist. If no pid is give it just refreshes
    loadConcept: function(pid) {
      pid = pid || properties.pids.concept;
      var tabpanel = Ext.getCmp('cmvtabpanel');
      var overview = tabpanel.getComponent('concept-overview');
      if(!overview && ContentModelViewer.widgets.OverviewPanel != undefined) { // Create the panel and insert it in the first position if it doesn't exist.
        tabpanel.insert(0, Ext.create('ContentModelViewer.widgets.OverviewPanel', {
          title:'Concept Overview',
          itemId: 'concept-overview',
          pid: pid
        }));
      }
      else if (overview) {
        overview.setPid(pid)
      }
    },
    // Shows a Resource, has no effect on the Current Collection, Focus Viewer and Manage panels on the Resource. If pid is null display the add form.
    loadResource: function(prop) {
      prop = prop || { pid: properties.pids.resource };
      prop.pid = prop.pid !== undefined ? prop.pid : properties.pids.resource;
      var tabpanel = Ext.getCmp('cmvtabpanel');
      var overview = tabpanel.getComponent('resource-overview');
      if(!overview && ContentModelViewer.widgets.OverviewPanel != undefined) { // Create the panel and insert it in the first position if it doesn't exist.
        tabpanel.insert(2, Ext.create('ContentModelViewer.widgets.OverviewPanel', {
          title:'Resource Overview',
          itemId: 'resource-overview',
          pid: prop.pid,
          url: prop.url
        }));
      }
      else if (overview) {
        overview.setPid(prop.pid)
      }
    },
    // Hides the Resource Panel changes the focus of the
    closeResource: function() {
      properties.pids.resource = undefined;
      var overview = Ext.getCmp('cmvtabpanel').getComponent('resource-overview');
      if(overview) {
        overview.close();
      }
    },
    // Display the collection panel with all of the given concepts resources.
    loadResources: function(pid) {
      pid = pid || properties.pids.concept;
      var resources = Ext.getCmp('collectionpanel');
      if(!resources && ContentModelViewer.widgets.CollectionPanel != undefined) { // Create the panel and insert it in the after the Concept Overview if it doesn't exist.
        Ext.getCmp('cmvtabpanel').insert(1, Ext.create('ContentModelViewer.widgets.CollectionPanel', {
          pid: pid
        }));
      }
      else if(resources) {
        resources.setPid(pid); // The Collection panel should show the resources of the given concept.
      }
    },
    // Display the viewer
    loadViewer: function (pid) {
      var panel = Ext.getCmp('viewerpanel');
      var dsid, viewFunction;
      // @TODO get the rest of the params
      if(!panel && ContentModelViewer.widgets.ViewerPanel != undefined) { // Create the panel and insert it in the first position if it doesn't exist.
        Ext.getCmp('cmvtabpanel').add(Ext.create('ContentModelViewer.widgets.ViewerPanel', {
          pid: pid,
          dsid: dsid,
          viewFunction: viewFunction
        }));
      }
      else if(panel) {
        panel.setPid(pid);
      }
    },
    loadManage: function(pid) {
      var panel = Ext.getCmp('managepanel');
      if(!panel && ContentModelViewer.widgets.ManagePanel != undefined) { // Create the panel and insert it in the last position if it doesn't exist.
        Ext.getCmp('cmvtabpanel').add(Ext.create('ContentModelViewer.widgets.ManagePanel', {
          pid: pid
        }));
      }
      else if(panel) {
        panel.setPid(pid);
      }
    },
    loadAddResourceForm: function () {
      var cmv = this;
      var overview = Ext.getCmp('cmvtabpanel').getComponent('resource-overview');
      var url = ContentModelViewer.properties.url.object.add(ContentModelViewer.properties.pids.concept, 'resource');
      var form_selector = '#add-resource-form form';
      var success = function(loader, response, options) {
        if(response.responseText != undefined) {
          var data = JSON.parse(response.responseText);
          if(data.refresh) {
            cmv.refreshTreeNodes(ContentModelViewer.properties.pids.concept); // Update the number in the tree
            cmv.selectResource(data.refresh); // Should be newly created object.
            cmv.refreshResources(); // Show object in page if possible.
          }
        }
      }
      if(!overview) {
        this.loadResource({ url: url });
      }
      else {
        overview.loadAddObjectContent(url, form_selector, success);
      }
      this.showResource();
    },
    loadAddConceptForm: function () {
      var cmv = this;
      var url = ContentModelViewer.properties.url.object.add(ContentModelViewer.properties.pids.concept, 'concept');
      Ext.getCmp('cmvtabpanel').getComponent('concept-overview').loadAddObjectContent(url, '#add-concept-form form', function(loader, response, options) {
        if(response.responseText != undefined) {
          var data = JSON.parse(response.responseText);
          if(data.refresh) {
            cmv.refreshTreeNodes(ContentModelViewer.properties.pids.concept); // Update the object we were previously on
            cmv.refreshTree(ContentModelViewer.properties.pids.concept);
            cmv.selectConcept(data.refresh); // Should be newly created object.
          }
        }
      });
    },
    loadResourceEditMetadataForm: function () {
      var cmv = this;
      Ext.getCmp('cmvtabpanel').getComponent('resource-overview').loadEditMetadataContent('#resource-metadata-form form', function(loader, response, options) {
        if(response.responseText != undefined) {
          var data = JSON.parse(response.responseText);
          if(data.refresh) {
            cmv.refreshResource();
            cmv.refreshResources();
          }
        }
      });
    },
    loadConceptEditMetadataForm: function () {
      var cmv = this;
      Ext.getCmp('cmvtabpanel').getComponent('concept-overview').loadEditMetadataContent('#concept-metadata-form form', function(loader, response, options) {
        if(response.responseText != undefined) {
          var data = JSON.parse(response.responseText);
          if(data.refresh) {
            cmv.refreshTreeNodes(data.refresh);
          }
        }
      });
    },
    //
    loadResourceEditPermissionForm: function () {
      Ext.getCmp('cmvtabpanel').getComponent('resource-overview').loadEditPermissionContent('#resource-permission-form form');
    },
    //
    loadConceptEditPermissionForm: function () {
      Ext.getCmp('cmvtabpanel').getComponent('concept-overview').loadEditPermissionContent('#concept-permission-form form');
    },
    //
    refreshConcept: function() {
      var panel = Ext.getCmp('cmvtabpanel').getComponent('concept-overview');
      if(panel) {
        panel.refresh();
      }
    },
    //
    refreshResource: function() {
      var panel = Ext.getCmp('cmvtabpanel').getComponent('resource-overview');
      if(panel) {
        if(properties.pids.resource !== undefined) {
          panel.refresh();
        }
        else {
          this.closeResource();
          this.showConcept();
        }
      }
    },
    //
    refreshResources: function() {
      Ext.getCmp('collectionpanel').refresh();
    },
    refreshTreeNodes: function(pid) {
      Ext.getCmp('cmvtreepanel').refreshNodes(pid);
    },
    // Reloads the tree data.
    refreshTree: function(pid) {
      Ext.getCmp('cmvtreepanel').refreshChildren(pid);
    },
    refreshTreeParents: function(pid) {
      Ext.getCmp('cmvtreepanel').refreshParents(pid);
    },
    //
    showConcept: function() {
      var tabpanel = Ext.getCmp('cmvtabpanel');
      var panel = tabpanel.getComponent('concept-overview');
      if(panel) {
        Ext.getCmp('cmvtabpanel').setActiveTab(panel);
      }
    },
    //
    showResource: function() {
      var tabpanel = Ext.getCmp('cmvtabpanel');
      var panel = tabpanel.getComponent('resource-overview');
      if(panel) {
        // Check to see if we can show the viewer?
        tabpanel.setActiveTab(panel);
      }
    },
    //
    showViewer: function() {
      var panel = Ext.getCmp('viewerpanel');
      if(panel) {
        Ext.getCmp('cmvtabpanel').setActiveTab(panel);
        // TODO set the default view datastream? or do so in the load function?
      }
    },
    // Olderstuff
    // This pid determines whats shown in the tree and if the ConceptOverview is shown
    setCollectionPid: function(pid) {
      properties.pids.collection = pid;
      var collection = Ext.getCmp('collectionpanel');
      collection.setPid(pid);
    },
    // Determines whats shown in viewer/manage
    setFocusedPid: function(pid, isCollection) {
      properties.pids.focused = pid;
      var viewer = Ext.getCmp('viewerpanel'), manage = Ext.getCmp('managepanel');
      if(!isCollection) {
        var tabpanel = Ext.getCmp('cmvtabpanel');
        var resourceOverview = tabpanel.getComponent('resource-overview');
        if(!resourceOverview) { // Create
          var index = properties.isCollection ? 2 : 1;
          tabpanel.insert(index, Ext.create('ContentModelViewer.widgets.OverviewPanel', {
            title:'Resource Overview',
            itemId: 'resource-overview',
            pid: pid
          }));
          resourceOverview = tabpanel.getComponent('resource-overview');// pp added this
        }
        else {
          resourceOverview.setPid(pid);
        }
      }
      tabpanel.setActiveTab(resourceOverview);//pp added this
      viewer.setPid(pid);
      manage.setPid(pid);
    },
    isPidFocused: function(pid) {
      return properties.pids.focused == pid;
    },
    selectDatastreamRecord: function(record) {
      properties.dsid = record.get('view');
      properties.viewFunction = record.get('view_function');
    },
    viewSelectedDatastreamRecord: function() {
      var viewer = Ext.getCmp('datastream-viewer');
      var loader = viewer.getLoader();
      loader.load({
        url: url.datastream.view(properties.pid, properties.dsid)
      });
      var viewerPanel = viewer.up('panel');
      var tabpanel = viewer.up('tabpanel');
      tabpanel.setActiveTab(viewerPanel);
    },
    callDatastreamViewFunction: function() {
      var pid = properties.pid;
      var dsid = properties.dsid;
      var view_function = properties.viewFunction;
      if(view_function) {
        eval(view_function)(pid, dsid);
      }
    }
  }
}
/**
 * Defines models that repersent Fedora objects/data streams.
 */
ContentModelViewer.setup.defineModels = function() {
  // Local Variables
  var properties = ContentModelViewer.properties;
  var url = properties.url, pid = properties.pid, root = properties.root, dsid = properties.dsid;
  Ext.define('ContentModelViewer.models.FedoraObject', {
    extend: 'Ext.data.Model',
    fields: [{
      name: 'pid',
      type: 'string'
    },{
      name: 'link',
      type: 'string'
    }, {
      name: 'label',
      type: 'string'
    }, {
      name: 'description',
      type: 'string'
    }, {
      name: 'owner',
      type: 'string'
    }, {
      name: 'created',
      type: 'string'
    }, {
      name: 'modified',
      type: 'string'
    }, {
      name: 'tn',
      type: 'string'
    }, {
      name: 'isCollection',
      type: 'boolean'
    },{
      name: 'originalMetadata',
      type: 'boolean',
      defaultValue: false
    }]
  });
  Ext.define('ContentModelViewer.models.treemembers', {
    extend: 'Ext.data.Model',
    fields: ['id','text', 'link','pid','leaf','children'],
    proxy: {
      type: 'ajax',
      url : url.object.treemembers(root),
      reader: {
        type: 'json',
        root: 'data'
      }
    }
  });
  Ext.define('ContentModelViewer.models.ObjectProperties', {
    extend: 'Ext.data.Model',
    fields: [{
      name: 'label',
      type: 'string'
    }, {
      name: 'state',
      type: 'string'
    }, {
      name: 'owner',
      type: 'string'
    }, {
      name: 'created',
      type: 'string'
    }, {
      name: 'modified',
      type: 'string'
    }],
    validations: [{
      type: 'inclusion',
      field: 'state',
      list: ['Active', 'Inactive', 'Deleted']
    }]
  });
  Ext.define('ContentModelViewer.models.Datastream', {
    extend: 'Ext.data.Model',
    idProperty: 'dsid',
    fields: [{
      name: 'dsid',
      type: 'string'
    }, {
      name: 'label',
      type: 'string'
    }, {
      name: 'state',
      type: 'string'
    }, {
      name: 'created',
      type: 'string'
    }, {
      name: 'mime',
      type: 'string'
    }, {
      name: 'view',
      type: 'string'
    }, {
      name: 'download',
      type: 'string'
    }, {
      name: 'tn',
      type: 'string'
    }, {
      name: 'view_function',
      type: 'string'
    }, {
      name: 'edit',
      type: 'bool'
    }, {
      name: 'default',
      type: 'bool'
    }],
    validations: [{
      type: 'inclusion',
      field: 'state',
      list: ['A', 'I']
    }],
    proxy: {
      type: 'rest',
      url : url.object.datastreams(pid, dsid),
      reader: {
        type: 'json',
        root: 'data',
        totalProperty: 'total'
      }
    }
  });
}
/**
 * Create stores.
 */
ContentModelViewer.setup.createStores = function() {
  var properties = ContentModelViewer.properties, models = ContentModelViewer.models;
  var url = properties.url, pid = properties.pid, dsid = properties.dsid;
  /**
   * Collection Members
   *
  Ext.create('Ext.data.Store', {
    storeId:'members',
    model: models.FedoraObject,
    autoLoad: true,
    autoSync: true,
    pageSize: 20,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
      property : 'label',
      direction: 'ASC'
    }],
    filters: [{
      property: 'label',
      value: null
    }],
    proxy: {
      type: 'ajax',
      url : url.object.members(pid),
      reader: {
        type: 'json',
        root: 'data'
      }
    }
  });*/
  /**
   * Tree Store
   */
  var icon = 'folder';
  var rootowner = 'Root';
  if (properties.root != 'si:root') {
    icon = 'peopleCModel';
    rootowner = properties.rootowner;
  }
  Ext.create('Ext.data.TreeStore', {
    storeId:'treemembers',
    folderSort: false,
    model: models.treemembers,
    sorters: [{
      property: 'text',
      direction: 'ASC'
    }],
    root: {
       text: rootowner,
       iconCls: icon,
       expanded: true,
       pid: properties.root
    }
  });
}

/**
 * Document Ready: Main
 */
Ext.require('Ext.data.TreeStore');
Ext.onReady(function(){
  // Local Variables
  var setup = ContentModelViewer.setup;
  setup.initProperties();
  setup.defineFunctions();
  setup.defineModels();
  setup.createStores();
});
