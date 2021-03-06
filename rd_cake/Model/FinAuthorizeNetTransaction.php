<?php
App::uses('AppModel', 'Model');

class FinAuthorizeNetTransaction extends AppModel {

    public $name        = 'FinAuthorizeNetTransaction';
    public $actsAs      = array('Containable');

    public $belongsTo = array(
        'User' => array(
            'className'     => 'User',
			'foreignKey'    => 'user_id'
        ),
        'Voucher'   => array(
            'className'     => 'Voucher',
			'foreignKey'    => 'voucher_id'
        )
	);

    public $hasMany = array(
        'FinAuthorizeNetTransactionNote'  => array(
            'dependent'     => true   
        )
    );
}
?>
