Ext.define('Rd.view.aps.cmbApHardwareModels', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbApHardwareModels',
    fieldLabel      : i18n("sHardware_model"),
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'hardware',
    name            : 'hardware',
    value           : 'dragino', //Default value
    labelClsExtra   : 'lblRd',
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name','radios'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake2/rd_cake/aps/hardware_options.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
