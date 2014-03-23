//Work Object
function Work() {
	var scrypt = scrypt_module_factory();  
	var self = this;
	this.DEFAULT_TIMEOUT = 10000; // ms
	this.responseTime;
	
	this.data; // little-endian
	this.target; // little-endian
	this.header; // big-endian
	
	this.from=0;
	this.step=10000;
	
	this.getWork = function() {
		
		var request = {};
		request.method = 'getwork';
		request.params = [];
		request.id = 0;

		var data = JSON.parse(self.sAjax('proxy.php', JSON.stringify(request)));
		
//		var data = {"error": null, "id": 0, "result": {"hash1": "00000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000010000", "data": "00000002089eb61b0f7e1207a539db9989cf6fae35785cb5e653f1883ac64c8ca213df387794c0a3f5ef153882ad12f4da2b709306b44a83a9e984b7a6871dde5ee5221a530b130b1b16d3ff7f240000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000080020000", "target": "0000ffff00000000000000000000000000000000000000000000000000000000", "midstate": "2b62d0e5dd00cc7d267dc7cc77527e4ad652c4fdc2378d209907f988065c0435"}};
		self.responseTime = (new Date()).getTime();
		self.data = self.hexStringToByteArray(data.result.data);
		self.target = self.hexStringToByteArray(data.result.target);
		self.header = self.headerByData(self.data);

		self.from = parseInt( data.result.from);
		self.step = parseInt( data.result.step);
	};
	
	this.submit = function(nonce) {
		
		var d = self.data.slice(0);
		d[79] = nonce >>  0;
		d[78] = nonce >>  8;
		d[77] = nonce >> 16;
		d[76] = nonce >> 24;
		
		var sData = self.byteArrayToHexString(d);
		
		var request = {};
		request.method = 'getwork';
		request.params = [ sData ];
		request.id = 1;

		var data = JSON.parse(self.sAjax('proxy.php', JSON.stringify(request)));
		return data.result;
	};
	
	this.reverseDataByByte = function(data){
		var h=[];
		var len = data.length;
		for( var i=0; i<len; h[i]=data[len-1-i],i++){}
		return h;
	}

        this.headerByData = function(data) {
              var h = [];
		for(var i=0;i <20;i++){
			h = h.concat(this.reverseDataByByte(data.slice(i*4,(i+1)*4)));
		}
              return h;
        };
	
	this.meetsTarget = function(nonce, hashes) {

		self.header[76] = nonce >> 0;
		self.header[77] = nonce >> 8;
		self.header[78] = nonce >> 16;
		self.header[79] = nonce >> 24;

		var hash = scrypt.crypto_scrypt(self.header,self.header,1024,1,1,32);
		if(hashes%200==0) {
			
			postMessage({'logMessage': 'Latest hash (#'+hashes+'): '+self.byteArrayToHexString(hash)});
			
		}
		
		for (var i = hash.length - 1; i >= 0; i--) {
			if ((hash[i] & 0xff) > (self.target[i] & 0xff)) {
				return false;
			}
			if ((hash[i] & 0xff) < (self.target[i] & 0xff)) {
				return true;
			}
		}
		return true;
	};
	
	
	this.hexStringToByteArray = function(s) {
		
	    var len = s.length;
	    var data = [];
	    for(var i=0; i<(len/2); data[i++]=0) {} 
	    for (var i = 0; i < len; i += 2) {
	        data[i / 2] = (parseInt(s.charAt(i), 16) << 4)
	                             + parseInt(s.charAt(i+1), 16);
	    }
	    return data;
	};
	
	this.byteArrayToHexString = function(b) {
		var sb = [];
		for (var i = 0; i < b.length; i++) {
			sb.push(((b[i] & 0xff) + 0x100).toString(16).substring(1));
		}
		return sb.join("");
	};
	
	this.getAge = function() {
		return (new Date()).getTime() - self.responseTime;
	};
	
	this.sAjax = function(url, data) {
		try {
			ajax = new XMLHttpRequest();
			
		} catch(err) {
			ajax = new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		if (ajax) {
			ajax.open("POST", url, false);
			ajax.setRequestHeader("Content-type", "application/json");
			ajax.send(data);
			return ajax.responseText;
		} else {
			return false;
		} 
		
	};

	this.calHash=function(thework){
		var theHeader =self.headerByData(self.hexStringToByteArray(thework));
		var hash = scrypt.crypto_scrypt(theHeader,theHeader,1024,1,1,32);
		return 	self.byteArrayToHexString(hash);
	}
	
}
