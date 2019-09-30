function Sequence(opt){
    this.width = opt.width;
    this.height = opt.height;
    this.id = opt.id;
    this.evtId=opt.evtId;
    this.cvsId=opt.cvsId;
    this.init(opt.img,opt.cb);
}

Sequence.prototype = {
    id:null,
    cvsId:null,
    width:0,
    height:0,
    evtId:null,
    canvarImage:{
        sx:0,
        sy:0,
        swidth:0,
        sheight:0,
        x:0,
        y:0,
        width:0,
        height:0
    },
    move:{},
    sequence_page:0,
    init: function(url,cb){
        var host = this;
        this._img = new Image();
        this._img.setAttribute('crossOrigin', 'anonymous');
        this._img.src = url;
        this._img.onload = function(){
            host.canvarImage.swidth = host._img.width;
            host.canvarImage.sheight = host._img.height;
            host.setShowImg();
            cb()
        }

    },
    setShowImg: function(){
        this.sizeImg();
        this.canvarBox = $('#'+this.id);
        var $canvas = $('<canvas id="'+ (this.cvsId) +'" width="' + (this.width) + '" height="' + (this.height) + '" style="position:absolute;left:0px;top:0px;"></canvas>');
        this.canvarBox.html($canvas);
        this._ctx = $canvas[0].getContext('2d');
        this.results();
        document.getElementById(this.evtId).addEventListener("touchstart",startHandler);
        document.getElementById(this.evtId).addEventListener("touchmove",moveHandler);
        document.getElementById(this.evtId).addEventListener("touchend",endHandler);

        var mo = this;
        var motion = 0;
        //手指按下的处理事件
        function startHandler(evt){
            evt.stopPropagation();
            // 记录第一个手指按下的坐标
            mo.move.startX0 = evt.touches[0].pageX;
            mo.move.startY0 = evt.touches[0].pageY;
            if(motion == 0){
                motion = 2;
            }
            //记录第二个手指坐标
            if(evt.touches[1]){
                mo.move.rangeStart = Math.sqrt(Math.pow(evt.touches[1].pageX - evt.touches[0].pageX,2) + Math.pow(evt.touches[1].pageY - evt.touches[0].pageY,2));
                motion = 1;

            }
        };

        //手指移动的处理事件
        function moveHandler(evt){
            evt.stopPropagation();
            //兼容chrome android，阻止浏览器默认行为
            evt.preventDefault();
            mo.move.moveX0 = evt.targetTouches[0].pageX;
            mo.move.moveY0 = evt.targetTouches[0].pageY;
            if(evt.touches[1]){

                mo.move.moveX1 = evt.targetTouches[1].pageX;
                mo.move.moveY1 = evt.targetTouches[1].pageY;
                mo.move.rangeMove = Math.sqrt(Math.pow(evt.targetTouches[1].pageX - evt.targetTouches[0].pageX,2) + Math.pow(evt.targetTouches[1].pageY - evt.targetTouches[0].pageY,2));

                mo.move.drawMove =  mo.move.rangeMove - mo.move.rangeStart;
                if(motion == 1 || motion == 0){
                    mo.drag();
                    mo.move.rangeStart = mo.move.rangeMove;
                    //alert("drop")
                }

            }else{
                if(motion == 2 || motion == 0){
                   // alert("zoom")
                    mo.zoom();
                }
            }
        };

        //手指抬起的处理事件
        function endHandler(evt){
            evt.preventDefault();
            this.move = {};
            if(evt.touches[0] == null && evt.touches[1] == null){
                motion = 0;
                //mo.repaint(y,x,width,height,2);
            }

        };

    },
    sizeImg:function(){
        var ratioBox = this.width/this.height; // 画布比例
        var ratioImage = this._img.width / this._img.height;// 画布比例
        if(ratioBox > ratioImage){ //竖
            this.canvarImage.width = this.width;
            this.canvarImage.height = (this.width/this._img.width)*this._img.height;
            this.canvarImage.x = 0;
            this.canvarImage.y = -(this.canvarImage.height - this.height) / 2;
        }else if(ratioBox <= ratioImage){ //横
            this.canvarImage.width = (this.height/this._img.height)*this._img.width;
            this.canvarImage.height = this.height;
            this.canvarImage.x = -(this.canvarImage.width - this.width) / 2;
            this.canvarImage.y = 0;
        }
    },

    results:function(){
        this._ctx.clearRect(0,0,this.width,this.height);
        // alert(this.canvarImage.sx +","+ this.canvarImage.sy +","+ this.canvarImage.swidth +","+ this.canvarImage.sheight +","+ this.canvarImage.x +","+ this.canvarImage.y +","+ this.canvarImage.width +","+ this.canvarImage.height);
        this._ctx.drawImage(this._img,this.canvarImage.sx,this.canvarImage.sy,this.canvarImage.swidth,this.canvarImage.sheight,this.canvarImage.x,this.canvarImage.y,this.canvarImage.width,this.canvarImage.height);
    },
    // 缩放
    drag:function(){
        var numH = (this.move.rangeMove - this.move.rangeStart)*3;
        var numW = (this._img.width/this._img.height)*numH;
        var y = this.canvarImage.y - (((Math.abs(this.canvarImage.y) + (this.height/2))/this.canvarImage.height) * numH);
        var x = this.canvarImage.x - (((Math.abs(this.canvarImage.x) + (this.width/2))/this.canvarImage.width) * numW);
        var width = this.canvarImage.width + parseInt(numW);
        var height = parseInt(this.canvarImage.height) + parseInt(numH);
        this.repaint(y,x,width,height,2);
    },

    // 拖动
    zoom:function(){
        var zoomX = this.move.moveX0 - this.move.startX0;
        var zoomY = this.move.moveY0 - this.move.startY0;
        var y = this.canvarImage.y + zoomY;
        var x = this.canvarImage.x + zoomX;
        var width = this.canvarImage.width;
        var height = this.canvarImage.height;
        this.repaint(y,x,width,height,1);
    },
    repaint:function(y,x,width,height,nature){
        if(y <= 0 && x <= 0 && width + x >= this.width && height + y >= this.height-10){
            this.canvarImage.x = parseInt(x);
            this.canvarImage.y = parseInt(y);
            this.canvarImage.width = parseInt(width);
            this.canvarImage.height = parseInt(height);
            if(nature == 1){
                this.move.startX0 = this.move.moveX0;
                this.move.startY0 = this.move.moveY0;
            }else{
                this.move.drawStart = this.move.drawMove;
            }
            this.results();
        }
    }
}
