/*Ext.onReady(function(){
  var sorter = (function() {
    var type = 0;
    var types = ['label', 'created'];
    var direction = 0;
    var directions = ['ASC', 'DESC'];
    var labels = ['Label', 'Date Created'];
    return {
      toggleType: function() {
        type = type ? 0 : 1;
      },
      toggleDirection: function() {
        direction = direction ? 0: 1;
      },
      type: function() {
        return types[type];
      },
      label: function() {
        return labels[type];
      },
      direction: function() {
        return directions[direction];
      },
      refresh: function() {
        var store = Ext.data.StoreManager.lookup('members');
        store.sorters.clear();
        store.sorters.add(new Ext.util.Sorter({
          property: this.type(),
          direction: this.direction()
        }));
        store.load();
      }
    };
  })();

  Ext.define('ContentModelViewer.widgets.CollectionPanels', {
    extend: 'Ext.panel.Panel',
    id: 'collectionpanel',
    itemId: 'collection',
    title: 'Resources',
    constructor: function(config) {
      this.callParent(arguments);
      this.store =
      this.setPid(config.pid);
    },
    setPid: function(pid) {
      this.getComponent('collectiondataview');
      this.pid = pid;
      var store = Ext.data.StoreManager.lookup('members');
      store.setProxy({
        type: 'ajax',
        url: ContentModelViewer.properties.url.object.members(pid),
        reader: {
          type: 'json',
          root: 'data'
        }
      });
      store.load();
    },
    dockedItems: [{
      xtype: 'toolbar',
      dock: 'top',
      items: [{
        xtype: 'tbtext',
        text: 'Sort By: '
      }, {
        xtype: 'tbtext',
        text: 'Search'
      }, {
        xtype: 'textfield',
        hideLabel: true
      }, {
        xtype: 'button',
        text: 'Go',
        handler: function(button, event) {
          // var store = Ext.data.StoreManager.lookup('members');
          // var filters = store.filters;
          // var label = filters.get(0);
          // var toolbar = button.up('toolbar');
          // var search = toolbar.down('textfield');
          // var value = Ext.String.trim(search.getValue());
          // label.value = value != '' ? value : null;
          // store.load();
        }
      }, '->', {
        xtype: 'button',
        text: 'Add resources',
        handler: function(button, event) {
          /*var form = Ext.get("datastream-edit-form");
          var tempUrl = window.location.toString();
          var index = tempUrl.indexOf('/fedora/repository');
          tempUrl = tempUrl.substr(0,index)+'/fedora/repository/'+ContentModelViewer.properties.pids.focused;
          form.set({
            action: tempUrl //window.location // Same Spot.
          });
          var action = form.down('input[name="action"]');
          action.set({
            value: 'ingest'
          });
          document.forms["datastream-edit-form"].submit();
        }
      }]
    },  {
      id: 'collection-pager-top',
      xtype: 'pagingtoolbar',
      store: Ext.data.StoreManager.lookup('members'),   // same store GridPanel is using
      dock: 'top',
      displayInfo: true
    }, {
      id: 'collection-pager-bottom',
      xtype: 'pagingtoolbar',
      store: Ext.data.StoreManager.lookup('members'),   // same store GridPanel is using
      dock: 'bottom',
      displayInfo: true
    }],
    /*items: [{
      xtype: 'dataview',
      store: Ext.data.StoreManager.lookup('members'),
      itemSelector: 'div.x-dataview-item',
      emptyText: 'No Files Available',
      deferEmptyText: false,
      itemTpl: new Ext.XTemplate(
        '<tpl for=".">',
        ' <tpl if="originalMetadata">',
        '  <div class="member-item {[xindex % 2 === 0 ? "even" : "odd"]} unedited">',
        '   <span style="float:left;text-align:center">',
        '    <img class="member-item-img" src="{tn}"></img>',
        '   </span>',
        '   <div class="member-item-label">{label}</div>',
        '  </div>',
        ' </tpl>',
        ' <tpl if="!originalMetadata">',
        '  <div class="member-item {[xindex % 2 === 0 ? "even" : "odd"]} edited">',
        '   <span style="float:left;text-align:center">',
        '    <img class="member-item-img" src="{tn}"></img>',
        '   </span>',
        '   <div class="member-item-label">{label}</div>',
        '  </div>',
        ' </tpl>',
        '</tpl>',
        {
          compiled: true,
          disableFormats: true,
          getLabel: function(label) {
            var empty = jQuery.trim(label) == '';
            return empty ? 'Default Label: (Please notify an administrator to provide a label)' : label;
          },
          isUnedited: function(originalMetadata) {
          return originalMetadata;
          }
        }),
      listeners: {
        selectionchange: function(view, selections, options) {
          var record = selections[0];
          if(record) {
            var pid = record.get('pid');
            ContentModelViewer.functions.selectResource(pid);
          }
          /*
          var func = ContentModelViewer.functions;
          var record = selections[0];
          if(record) {
            var pid = record.get('pid');
            var isCollection = record.get('isCollection');
            func.setFocusedPid(pid, isCollection);
          }*
        },
        itemdblclick: function(view, record) {
          var pid = record.get('pid');
          ContentModelViewer.functions.selectResource(pid);
          /*var func = ContentModelViewer.functions;
          var pid = record.get('pid');
          var isCollection = record.get('isCollection');
          if(isCollection) {
            var link = record.get('link');
            window.location = link;
          }
          else {
            func.setCollectionPid(pid, isCollection);
          }*
        }
      }
    }]*
  });
});*/

Ext.onReady(function(){
  Ext.define('ContentModelViewer.widgets.CollectionDataView', {
	  extend: 'Ext.view.View',
	  itemId: 'collectiondataview',
	  itemSelector: 'div.x-dataview-item',
	  emptyText: 'No Files Available',
	  deferEmptyText: false,
    deferInitialRefresh: false,
	  itemTpl: new Ext.XTemplate(
		  '<tpl for=".">',
		  ' <tpl if="originalMetadata">',
		  '	 <div class="member-item {[xindex % 2 === 0 ? "even" : "odd"]} unedited">',
		  '		<span style="float:left;text-align:center">',
		  '		 <img class="member-item-img" src="{tn}"></img>',
		  '		</span>',
		  '		<div class="member-item-label">{label}</div>',
		  '	 </div>',
		  ' </tpl>',
		  ' <tpl if="!originalMetadata">',
		  '	 <div class="member-item {[xindex % 2 === 0 ? "even" : "odd"]} edited">',
		  '		<span style="float:left;text-align:center">',
		  '		 <img class="member-item-img" src="{tn}"></img>',
		  '		</span>',
		  '		<div class="member-item-label">{label}</div>',
		  '	 </div>',
		  ' </tpl>',
		  '</tpl>',
		  {
			  compiled: true,
			  disableFormats: true,
			  getLabel: function(label) {
				  var empty = jQuery.trim(label) == '';
				  return empty ? 'Default Label: (Please notify an administrator to provide a label)' : label;
			  },
			  isUnedited: function(originalMetadata) {
				  return originalMetadata;
			  }
		  }
	  ),
	  listeners: {
		  selectionchange: function(view, selections, options) {
			  var record = selections[0];
			  if(record) {
				  ContentModelViewer.functions.selectResource(record.get('pid'));
			  }
		  },
		  itemdblclick: function(view, record) {
			  ContentModelViewer.functions.selectResource(record.get('pid'));
		  }
	  },
	  setPid: function(pid) {
		  this.pid = pid;
		  this.store.setProxy({
			  type: 'ajax',
			  url: ContentModelViewer.properties.url.object.members(pid),
			  reader: {
				  type: 'json',
				  root: 'data'
			  }
		  });
		  this.store.load();
	  },
	  constructor: function(config) {
		  this.callParent(arguments);
		  this.bindStore(Ext.create('Ext.data.Store', {
			  model: ContentModelViewer.models.FedoraObject,
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
				  url : ContentModelViewer.properties.url.object.members(config.pid),
				  reader: {
					  type: 'json',
					  root: 'data'
				  }
			  }
		  }));
	  }
  });
  Ext.define('ContentModelViewer.widgets.CollectionPanel', {
	  extend: 'Ext.panel.Panel',
	  id: 'collectionpanel',
	  itemId: 'collection',
	  title: 'Resources',
	  constructor: function(config) {
		  this.callParent(arguments);
		  this.add(Ext.create('ContentModelViewer.widgets.CollectionDataView', { pid: config.pid }));
      var store = this.getComponent('collectiondataview').getStore();
      var sorter = (function() {
        var type = 0;
        var types = ['label', 'created'];
        var direction = 0;
        var directions = ['ASC', 'DESC'];
        var labels = ['Label', 'Date Created'];
        return {
          toggleType: function() {
            type = type ? 0 : 1;
          },
          toggleDirection: function() {
            direction = direction ? 0: 1;
          },
          type: function() {
            return types[type];
          },
          label: function() {
            return labels[type];
          },
          direction: function() {
            return directions[direction];
          },
          refresh: function() {
            store.sorters.clear();
            store.sorters.add(new Ext.util.Sorter({
              property: this.type(),
              direction: this.direction()
            }));
            store.load();
          }
        };
      })();
		  this.addDocked(Ext.create('Ext.toolbar.Toolbar', {
        itemId: 'toolbar',
        dock: 'top',
        items: [{
          xtype: 'tbtext',
          text: 'Sort By: '
        }, Ext.create('Ext.Action', {
          text : sorter.label(),
          handler: function(action, event) {
            sorter.toggleType();
            action.setText(sorter.label());
            sorter.refresh();
          }
        }), {
          xtype: 'sortbutton',
          text : sorter.direction(),
          listeners: {
            changeDirection: function(direction) {
              sorter.toggleDirection();
              this.setText(sorter.direction());
              sorter.refresh();
            }
          }
        }, {
          xtype: 'tbtext',
          text: 'Search'
        }, {
          xtype: 'textfield',
          hideLabel: true,
	  width: 200
        }, {
          xtype: 'button',
          text: 'Go',
          handler: function(button, event) {
            var filters = store.filters;
            var label = filters.get(0);
            var toolbar = button.up('toolbar');
            var search = toolbar.down('textfield');
            var value = Ext.String.trim(search.getValue());
            label.value = value != '' ? value : null;
            store.load();
          }
        }, '->', {
          xtype: 'button',
          text: 'Add a new Resource',
          handler: function(button, event) {
            ContentModelViewer.functions.loadAddResourceForm();
          }
        }],
        constructor: function(config) {
		      this.callParent(arguments);
        }
      }));   
      
		  this.addDocked(Ext.create('Ext.toolbar.Paging', { store: store, dock: 'top', displayInfo: true, itemId: 'top-pager' }));
      this.addDocked(Ext.create('Ext.toolbar.Paging', { store: store, dock: 'bottom', displayInfo: true, itemId: 'bottom-pager' }));
	  },
	  setPid: function(pid) {
		  this.getComponent('collectiondataview').setPid(pid);
	  },
    refresh: function() {
      this.getDockedComponent('top-pager').doRefresh();
    }
  });
});
