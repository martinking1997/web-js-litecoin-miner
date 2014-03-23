<?php
require('SimpleSHM.php');
function tolog($data){
	date_default_timezone_set('PRC');
	$logfile = "log.txt";
        $handle=fopen($logfile,'a+');
        fwrite($handle,date('Y-m-d H:i:s',time()).' '.$data."\n");
        fclose($handle);
}

function getworkfromstratumproxy( $data_string){
	$stratumProxy = "http://www.goodu.info:8332";
	$workerName = "martinking.js";
	$workerPass = "x";

	tolog($data_string);
	$ch = curl_init($stratumProxy);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_USERPWD, $workerName.":".$workerPass);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	    'Content-Type: application/json',
	    'Content-Length: ' . strlen($data_string))
	);
	$rs = curl_exec($ch);
	tolog($rs);
	return $rs;
}
function getSHMParas(){
	$shm_key = ftok(__FILE__, 'm');
	$theSHM = new SimpleSHM($shm_key);
	$theString = $theSHM->read();
	$tt= json_decode($theString? $theString:"",true);
	return $tt;
//	return json_decode('{"pp":"oo" }',true);
}
function setSHMParas($data){
	$shm_key = ftok(__FILE__, 'm');
	$theSHM = new SimpleSHM($shm_key);
	$theSHM->write(json_encode($data));
}

function getnewwork($data_string){
	$theSHMP= getSHMParas();
	$theSHMP['m_step'] = 4096;//1.5.bytes
	$theSHMP['m_max']= 0xffffffff;

	$cur_time = time();
//        tolog($theSHMP['m_pos']);

	if ( $cur_time > $theSHMP['m_next_time'] || strlen($theSHMP['m_current_work']) < 200 || $theSHMP['m_pos'] >= $theSHMP['m_max'] ){ 
//should get new work from miner pool
		$theSHMP['m_current_work'] = getworkfromstratumproxy($data_string);
        	$theSHMP['m_next_time'] = $cur_time + 60; //1 minutes
		$theSHMP['m_pos'] = 0;
		if ( strlen( $theSHMP['m_current_work'] ) < 200 ){
			//wrong,get no work,proxy may be down.
			return $theSHMP['m_current_work'];	
		}
	}else{
		$theSHMP['m_pos'] = $theSHMP['m_pos'] + $theSHMP['m_step'];
	}
	setSHMParas($theSHMP);
	return str_replace('"target"', '"from": "'.$theSHMP["m_pos"].'", "step": "'.$theSHMP['m_step'].'", "target"',$theSHMP['m_current_work']); 
}

	$return_str ="";

	$data_string = file_get_contents('php://input');
	if( strlen($data_string) < 6){
		$data_string = '{"method":"getwork","params":[],"id":0}';
	}
	if ( strstr($data_string,'"params":[]') == FALSE ){ //submitting work
		$return_str = getworkfromstratumproxy( $data_string );
	}else{
		$return_str = getnewwork($data_string);
	}
	echo $return_str;
?>
