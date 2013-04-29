Ext.define('ContentModelViewer.widgets.TreePanel', {
  extend: 'Ext.tree.Panel',
  constructor: function (config) {
    this.callParent(arguments);
  },
  id: 'cmvtreepanel',
  viewConfig : {selectedItemCls : "even"},
  region: 'west',
  folderSort: false,
  store:'treemembers',
  autoLoad: false,
  root: 'data',
  rootVisible: true,
  collapsible: true,
  collapseDirection: 'left',
  title: 'Projects',
  width: 250,
  useArrows: true,
  getNodesByPid: function(pid) {
    var nodes = [];
    if(typeof(pid) == 'string' && pid.length > 0) {
      var root = this.store.getRootNode();
      var cascadeFunc = function(n) {
        console.debug("NODES PID: " + n.get('pid'));
        console.debug("TARGET PID: " + pid);
        if(n.get('pid') == pid) { 
          nodes.push(n); 
        }
        return true;
      }
      root.cascadeBy(cascadeFunc);
    }
    return nodes;
  },
  getParentNodesByPid: function(pid) {
    var parents = [];
    var nodes = this.getNodesByPid(pid);
    for(var i = 0; i < nodes.length; i++) {
      var parent = nodes[i].parentNode;
      if(parent != null) {
        parents.push(parent);
      }
    }
    return parents;
  },
  loadNodes: function(nodes) {
    for(var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      this.refreshNodes(node.get('pid'));
      this.loadPid(node.get('pid'));
    }
  },
  loadPid: function(pid) {
    if(typeof(pid) == 'string' && pid.length > 0) {
      this.store.load({ url: ContentModelViewer.properties.url.object.treemembers(pid) });
    }
  },
  refreshChildren: function(pid) {
    if(pid != undefined) {
      if(pid == ContentModelViewer.properties.root) {
        this.loadPid(pid);
      }
      else {
        this.store.load({
          url: ContentModelViewer.properties.url.object.treemembers(pid),
        });
      }
    }
  },
  refreshParents: function(pid) {
    if(pid != undefined) {
      this.loadNodes(this.getParentNodesByPid(pid));
    }
  },
  refreshNodes: function(pid) {
    var nodes = this.getNodesByPid(pid);
    if (nodes.length > 0) {
      Ext.Ajax.request({
        url: ContentModelViewer.properties.url.object.treemember(pid),
        success: function(response){
          var responseData = JSON.parse(response.responseText);
          var children = responseData.data;
          for(var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.removeAll();
            if (children == null) {
            children = [];
            }
            node.appendChild(children);
            node.set('text', responseData.parents.label);
            node.set('leaf', false); // May have added a child.
            node.commit();
          }
        }
      });
    }
  },

  removeChildFromParent: function(object_pid, parent_pid) {
    var parents = this.getNodesByPid(parent_pid);
    for(var i = 0; i < parents.length; i++) {
      var parent = parents[i], child = null;
      while(child = parent.findChild('pid', object_pid)) {
        parent.removeChild(child, true);
      }
    }
  },
  listeners: {
    itemclick: {
      fn: function(view, record, item, index, event) {
        var pid = record.get('pid');
        if (record.data.id == 'root') {
          if (ContentModelViewer.properties.siUser) {
            pid = ContentModelViewer.properties.siUser;
          }
          else {
            pid = 'si:root';
          }
        }
        ContentModelViewer.functions.selectConcept(pid);
      }
    }
  }
});
