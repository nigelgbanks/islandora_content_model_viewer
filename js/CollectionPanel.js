Ext.onReady(function(){
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
  
  Ext.define('ContentModelViewer.widgets.CollectionPanel', {
    extend: 'Ext.panel.Panel',
    id: 'collectionpanel',
    itemId: 'collection',
    title: 'Resources',
    setPid: function(pid) {
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
      items: [ {
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
          changedirection: function(direction) {
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
        hideLabel: true
      }, {
        xtype: 'button',
        text: 'Go',
        handler: function(button, event) {
          var store = Ext.data.StoreManager.lookup('members');
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
        text: 'Add resources',
        handler: function(button, event) {
          var form = Ext.get("datastream-edit-form");
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
    items: [{
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
          var func = ContentModelViewer.functions;
          var record = selections[0];
          if(record) {
            var pid = record.get('pid');
            var isCollection = record.get('isCollection');
            func.setFocusedPid(pid, isCollection);
          }
        },
        itemdblclick: function(view, record) {
          var func = ContentModelViewer.functions;
          var pid = record.get('pid');
          var isCollection = record.get('isCollection');
          if(isCollection) {
            var link = record.get('link');
            window.location = link;
          }
          else {
            func.setCollectionPid(pid, isCollection);
          }
        }
      }
    }]
  });
});