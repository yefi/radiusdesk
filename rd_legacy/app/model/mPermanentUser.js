Ext.define('Rd.model.mPermanentUser', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'username',     type: 'string'  },
         {name: 'owner',        type: 'string'  },
		 {name: 'owner_id',		type: 'int'		},
         {name: 'auth_type',    type: 'string'  },
         {name: 'realm',        type: 'string'  },
         {name: 'realm_id'},
         {name: 'profile',      type: 'string'  },
         {name: 'profile_id'},
          'perc_time_used',
          'perc_data_used',
         'name','surname', 'phone', 'email', 'address',
         {name: 'active',       type: 'bool'    },
         {name: 'last_accept_time'},
         {name: 'last_accept_nas'},
         {name: 'last_reject_time'},
         {name: 'last_reject_nas'},
         {name: 'last_reject_message'},
         {name: 'from_date'},
         {name: 'to_date'},
         'data_usage',
         'time_usage',
         'data_cap',
         'time_cap',
		 {name: 'static_ip',    type: 'string'  },
		 {name: 'extra_name',   type: 'string'  },
		 {name: 'extra_value',  type: 'string'  },
         {name: 'notes',        type: 'bool'},
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});
