Ext.onReady(function(){
  Ext.define('ContentModelViewer.widgets.ObjectPropertiesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.objectpropertiespanel',
    config: {
      pid: 'required'
    },
    itemId: 'properties',
    height: 255,
    layout: {
      type: 'border'
    },
    setPid: function(pid) {
      this.pid = pid;
      var form = this.getComponent('form');
      if(form.rendered) {
        form.load({
          method: 'GET',
          waitMsg: 'Loading...',
          url: ContentModelViewer.properties.url.object.properties(pid)
        });
      }
    },
    dockedItems: [{
      xtype: 'toolbar',
      itemId: 'toolbar',
      dock: 'top',
      items: [{
        xtype: 'button',
        text: 'Edit Permissions',
        cls: 'x-btn-text-icon',
        iconCls: 'edit-datastream-icon',
        id: 'edit-xacml',
        handler: function() {
          Ext.Msg.alert('Action Restricted', 'This action is currently restricted');
        }
      }, {
        xtype: 'button',
        text: 'Purge Object',
        cls: 'x-btn-text-icon',
        iconCls: 'remove-datastream-icon',
        id: 'purge-object',
	      handler : function() {
          Ext.Msg.alert('Action Restricted', 'This action is currently restricted');
          /*Ext.Msg.show({
            title:'Purge Object?',
            msg: 'Are you sure you want to purge this object? This action cannot be undone.',
            buttons: Ext.Msg.YESNO,
            fn: function(choice) {
            if(choice == 'yes') {
            var url = ContentModelViewer.properties.url.object.purge;
            Ext.Ajax.request({
            url: url,
            method: 'POST',
            success: function(response){
            var data;
            data = Ext.decode(response.responseText);
            Ext.Msg.alert('Status', data.msg);
            if (data.success === true) {
            window.location.href = Drupal.settings.basePath + 'fedora/repository';                  }
            }
            });
            }
            },
            icon: Ext.window.MessageBox.QUESTION
            });*/
        }
      }]
    }],
    items: [{
      title: 'Object Properties',
      itemId: 'form',
      xtype: 'form',
      region: 'center',
      height: 245,
      bodyPadding: 10,
      waitMsgTarget: true,
      reader: Ext.create('Ext.data.reader.Json', {
        model: 'ContentModelViewer.models.ObjectProperties',
        root: 'data',
        successProperty: 'success'
      }),
      items: [{
        xtype: 'textfield',
        fieldLabel: 'Label',
        name: 'label',
        width: 350
      }, {
        xtype: 'textfield',
        fieldLabel: 'Owner',
        name: 'owner',
        width: 350
      }, {
        xtype: 'displayfield',
        fieldLabel: 'State',
        name: 'state',
        width: 400
      }, {
        xtype: 'displayfield',
        fieldLabel: 'Date Created',
        name: 'created',
        width: 400
      }, {
        xtype: 'displayfield',
        fieldLabel: 'Last Modified',
        name: 'modified',
        width: 400
      }],
      buttons: [{
        text: 'Save Changes',
        formBind: true, // Only enabled once the form is valid
        handler: function(button) {
          var url = ContentModelViewer.properties.url;
          var pid = this.findParentByType('objectpropertiespanel').pid;
          button.up('form').getForm().submit({
            url: url.object.properties(pid),
            waitMsg: 'Saving Data...',
            success: function(form, action) {
            // @todo revert the fields if submit fails.
            }
          });
        }
      }],
      listeners: {
        afterrender: function(form) {
          var pid = this.findParentByType('objectpropertiespanel').pid;
          form.load({
            method: 'GET',
            waitMsg: 'Loading...',
            url: ContentModelViewer.properties.url.object.properties(pid)
          });
        }
      }
    }]
  });
});