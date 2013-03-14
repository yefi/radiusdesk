Ext.define('Rd.controller.cDevices', {
    extend: 'Ext.app.Controller',
    actionIndex: function(){
        var me = this;
        var desktop = this.application.getController('cDesktop');
        var win = desktop.getWindow('devicesWin');
        if(!win){
            win = desktop.createWindow({
                id: 'devicesWin',
                title: i18n('sBYOD_manager'),
                width:800,
                height:400,
                iconCls: 'devices',
                animCollapse:false,
                border:false,
                constrainHeader:true,
                layout: 'border',
                stateful: true,
                stateId: 'devicesWin',
                items: [
                    {
                        region: 'north',
                        xtype:  'pnlBanner',
                        heading: i18n('sBYOD_manager'),
                        image:  'resources/images/48x48/byod.png'
                    },
                    {
                        region  : 'center',
                        xtype   : 'tabpanel',
                        layout  : 'fit',
                        xtype   : 'tabpanel',
                        margins : '0 0 0 0',
                        border  : true,
                        items   : [
                            { 'title' : i18n('sRegistered_devices'), xtype: 'gridDevices'},
                            { 'title' : i18n('sUnclaimed_devices')}
                        ]
                    }
                ]
            });
        }
        desktop.restoreWindow(win);    
        return win;
    },

    views:  [
       'components.pnlBanner',          'devices.gridDevices',    'devices.winDeviceAddWizard',
       'components.cmbPermanentUser',   'components.cmbProfile',  'components.cmbCap',
       'components.winNote',            'components.winNoteAdd',  'components.winCsvColumnSelect'
    ],
    stores: [ 'sAccessProvidersTree',   'sPermanentUsers', 'sRealms',   'sProfiles',    'sDevices'  ],
    models: ['mAccessProviderTree',     'mPermanentUser',  'mRealm',    'mProfile',     'mDevice'   ],
    selectedRecord: null,
     config: {
        urlAdd:             '/cake2/rd_cake/devices/add.json',
      //  urlEdit:            '/cake2/rd_cake/profiles/edit.json',
        urlApChildCheck:    '/cake2/rd_cake/access_providers/child_check.json',
        urlExportCsv:       '/cake2/rd_cake/devices/export_csv',
        urlNoteAdd:         '/cake2/rd_cake/devices/note_add.json'
    },
    refs: [
        {  ref: 'grid',  selector:   'gridDevices'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        me.getStore('sDevices').addListener('load',me.onStoreDevicesLoaded, me);

        me.control({
           'gridDevices #reload': {
                click:      me.reload
            }, 
            'gridDevices #add'   : {
                click:      me.add
            },
            'gridDevices #delete'   : {
                click:      me.del
            },
            'gridDevices #edit'   : {
              //  click:      me.edit
            },
            'gridDevices #note'   : {
                click:      me.note
            },
            'gridDevices #csv'  : {
                click:      me.csvExport
            },
            'gridDevices'   : {
              //  select:      me.select
            },
            'winDeviceAddWizard' :{
                toFront: me.maskHide
            },

            'winDeviceAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            'winDeviceAddWizard #profile' : {
                change:  me.cmbProfileChange
            },
            'winDeviceAddWizard #always_active' : {
                change:  me.chkAlwaysActiveChange
            },
            'winDeviceAddWizard #to_date' : {
                change:  me.toDateChange
            },
            'winDeviceAddWizard #from_date' : {
                change:  me.fromDateChange
            },
            '#winCsvColumnSelectDevices':{
                toFront:       me.maskHide
            },
            '#winCsvColumnSelectDevices #save': {
                click:  me.csvExportSubmit
            },
            'gridNote[noteForGrid=devices] #reload' : {
                click:  me.noteReload
            },
            'gridNote[noteForGrid=devices] #add' : {
                click:  me.noteAdd
            },
            'gridNote[noteForGrid=devices] #delete' : {
                click:  me.noteDelete
            },
            'gridNote[noteForGrid=devices]' : {
                itemclick: me.gridNoteClick
            },
            'winNote[noteForGrid=devices]':{
                toFront:       me.maskHide
            },
            'winNoteAdd[noteForGrid=devices] #btnNoteTreeNext' : {
                click:  me.btnNoteTreeNext
            },
            'winNoteAdd[noteForGrid=devices] #btnNoteAddPrev'  : {   
                click: me.btnNoteAddPrev
            },
            'winNoteAdd[noteForGrid=devices] #btnNoteAddNext'  : {   
                click: me.btnNoteAddNext
            }
        });

    },

    reload: function(){
        var me =this;
        me.getStore('sDevices').load();
    },
    maskHide:   function(){
        var me =this;
        me.getGrid().mask.hide();
    },

    add: function(button){  
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','winDeviceAddWizardId')){
            var w = Ext.widget('winDeviceAddWizard',{
                id:'winDeviceAddWizardId', selLanguage : me.application.getSelLanguage()
            });
            me.application.runAction('cDesktop','Add',w);         
        }  
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.urlAdd,
            success: function(form, action) {
                win.close();
                me.getStore('sDevices').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    cmbProfileChange:   function(cmb){
        var me      = this;
        var form    = cmb.up('form');
        var cmbCap  = form.down('cmbCap');
        var value   = cmb.getValue();
        var s = cmb.getStore();
        var r = s.getById(value);
        if(r != null){
            var cap = r.get('cap_in_profile');
            console.log(cap);
            if(cap){
                cmbCap.setVisible(true);
                cmbCap.setDisabled(false);
            }else{
                cmbCap.setVisible(false);
                cmbCap.setDisabled(true);
            }
        }
    },
    chkAlwaysActiveChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var from    = form.down('#from_date');
        var to      = form.down('#to_date');
        var value   = chk.getValue();
        if(value){
            to.setVisible(false);
            to.setDisabled(true);
            from.setVisible(false);
            from.setDisabled(true);
        }else{
            to.setVisible(true);
            to.setDisabled(false);
            from.setVisible(true);
            from.setDisabled(false);
        }
    },
    toDateChange: function(d,newValue,oldValue){
        var me = this;
        var form = d.up('form');   
        var from_date = form.down('#from_date');
        if(newValue <= from_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sEnd_date_wrong'),
                        i18n('sThe_end_date_should_be_after_the_start_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    fromDateChange: function(d,newValue, oldValue){
        var me = this;
        var form = d.up('form');
        var to_date = form.down('#to_date');
        if(newValue >= to_date.getValue()){
            Ext.ux.Toaster.msg(
                        i18n('sStart_date_wrong'),
                        i18n('sThe_start_date_should_be_before_the_end_date'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    select: function(grid,record){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...

        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
            }
        }

        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },

    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    me.getGrid().getStore().remove(me.getGrid().getSelectionModel().getSelection());
                    me.getGrid().getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.onStoreDevicesLoaded();   //Update the count   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.getGrid().getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    onStoreDevicesLoaded: function() {
        var me      = this;
        var count   = me.getStore('sDevices').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    },

    csvExport: function(button,format) {
        var me          = this;
        me.getGrid().mask.show(); 
        var columns     = me.getGrid().columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!me.application.runAction('cDesktop','AlreadyExist','winCsvColumnSelectDevices')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectDevices',columns: col_list});
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    csvExportSubmit: function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var chkList = form.query('checkbox');
        var c_found = false;
        var columns = [];
        var c_count = 0;
        Ext.Array.each(chkList,function(item){
            if(item.getValue()){ //Only selected items
                c_found = true;
                columns[c_count] = {'name': item.getName()};
                c_count = c_count +1; //For next one
            }
        },me);

        if(!c_found){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_one_or_more'),
                        i18n('sSelect_one_or_more_columns_please'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{     
            //next we need to find the filter values:
            var filters     = [];
            var f_count     = 0;
            var f_found     = false;
            var filter_json ='';
            me.getGrid().filters.filters.each(function(item) {
                if (item.active) {
                    f_found         = true;
                    var ser_item    = item.serialize();
                    ser_item.field  = item.dataIndex;
                    filters[f_count]= ser_item;
                    f_count         = f_count + 1;
                }
            });   
            var col_json        = "columns="+Ext.JSON.encode(columns);
            var extra_params    = Ext.Object.toQueryString(Ext.Ajax.extraParams);
            var append_url      = "?"+extra_params+'&'+col_json;
            if(f_found){
                filter_json = "filter="+Ext.JSON.encode(filters);
                append_url  = append_url+'&'+filter_json;
            }
            window.open(me.urlExportCsv+append_url);
            win.close();
        }
    },
    note: function(button,format) {
        var me      = this;
        me.getGrid().mask.show();      
        //Find out if there was something selected
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
            me.maskHide();
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){
                me.maskHide();
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{

                //Determine the selected record:
                var sr = me.getGrid().getSelectionModel().getLastSelected();
                
                if(!me.application.runAction('cDesktop','AlreadyExist','winNoteDevices'+sr.getId())){
                    var w = Ext.widget('winNote',
                        {
                            id          : 'winNoteDevices'+sr.getId(),
                            noteForId   : sr.getId(),
                            noteForGrid : 'devices',
                            noteForName : sr.get('name')
                        });
                    me.application.runAction('cDesktop','Add',w);       
                }
            }    
        }
    },
    noteReload: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        grid.getStore().load();
    },
    noteAdd: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        //See how the wizard should be displayed:
        Ext.Ajax.request({
            url: me.urlApChildCheck,
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){                      
                    if(jsonData.items.tree == true){
                        if(!me.application.runAction('cDesktop','AlreadyExist','winNoteDevicesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteDevicesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid
                            });
                            me.application.runAction('cDesktop','Add',w);       
                        }
                    }else{
                        if(!me.application.runAction('cDesktop','AlreadyExist','winNoteDevicesAdd'+grid.noteForId)){
                            var w   = Ext.widget('winNoteAdd',
                            {
                                id          : 'winNoteDevicesAdd'+grid.noteForId,
                                noteForId   : grid.noteForId,
                                noteForGrid : grid.noteForGrid,
                                refreshGrid : grid,
                                startScreen : 'scrnNote',
                                user_id     : '0',
                                owner       : i18n('sLogged_in_user'),
                                no_tree     : true
                            });
                            me.application.runAction('cDesktop','Add',w);       
                        }
                    }
                }   
            },
            scope: me
        });
    },
    gridNoteClick: function(item,record){
        var me = this;
        //Dynamically update the top toolbar
        grid    = item.up('gridNote');
        tb      = grid.down('toolbar[dock=top]');
        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    btnNoteTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winNoteAdd');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnNote');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnNoteAddPrev: function(button){
        var me = this;
        var win = button.up('winNoteAdd');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnNoteAddNext: function(button){
        var me      = this;
        var win     = button.up('winNoteAdd');
        console.log(win.noteForId);
        console.log(win.noteForGrid);
        win.refreshGrid.getStore().load();
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.urlNoteAdd,
            params: {for_id : win.noteForId},
            success: function(form, action) {
                win.close();
                win.refreshGrid.getStore().load();
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    noteDelete: function(button){
        var me      = this;
        var grid    = button.up('gridNote');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getStore().load();   //Update the count
                            me.reload();   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    }

});