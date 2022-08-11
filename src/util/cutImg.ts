import {onMounted, onUnmounted, ref} from 'vue';
type data = {
    cut : {
        w : number,
        h : number,
        top : number,
        left : number
    },
    preImg : {
        w : number,
        h : number,
        top : number,
        left : number
    }
}

class CutImg {
    private image : HTMLImageElement = new Image(); // 存放上传的图片
    private reader : FileReader = new FileReader();  //  读取图片
        
    private tImg : HTMLImageElement = new Image();     //目标图片
    private pImg : HTMLImageElement = new Image();     //预览图片
    private cFrame : HTMLDivElement = document.createElement('div') as HTMLDivElement;    //裁剪框
    private isSelected = ref<boolean>(false);
    private data : data = {
            cut : {
                w : 0,
                h : 0,
                top : 0,
                left : 0,
            },
            preImg : {
                w : 0,
                h : 0,
                top : 0,
                left : 0
            }
    }
    private staData = {
            originImg : {
                w : 0,
                h : 0
            },
            actualImg : {
                w : 0,
                h : 0
            },
            originCut : {      //定义边界（缩放用）
                w : 0,
                h : 0,
                left : 0,
                top : 0
            },
            originAreaW : 0,    //存放图片容器的宽
            preW : 0,           //预览图片的宽
            imgWhRatio : 0,     //图片的宽高比
            whRatio : 0,        //裁剪框的宽高比
            cutPreviewRatio : 0,      //裁剪框与预览框的大小比
            h : 0
    }
    private mouseData = {
        x : 0,
        y : 0,
        rules : {
            maxX : 0,
            minX : 0,
            minY : 0,
            maxY :0
        },
        curTarget : 0,
        oldTarget : 0,
    }

    private moveTarget : boolean = false;
    private scaleTarget : boolean = false;

    constructor() {

    } 
    //已选择图片
    selected = (e: File) => {
            
        if (e == null) {
            this.isSelected.value = false;
            return undefined;
        };
        this.reader.readAsDataURL(e);
        this.reader.onloadend = () => {
            this.image.src = String(this.reader.result);
            this.isSelected.value = true;
            this.image.onload = () => {
                //保存图片的原始大小 
                this.staData.originImg.w = this.image.width;
                this.staData.originImg.h = this.image.height;
                this.staData.imgWhRatio = this.staData.originImg.w / this.staData.originImg.h;
                //初始化
                this.init();
            }
        }

    }
    
    //初始化裁剪框和预览框
    private init = () => {
        if (this.tImg && this.pImg && this.isSelected.value) {
            
            if (this.staData.originImg.w > this.staData.originImg.h) {
                this.tImg.style.width = this.staData.originAreaW + 'px';
                this.tImg.style.height = 'auto';
                this.staData.actualImg.w = this.staData.originAreaW;
                this.staData.actualImg.h = this.staData.actualImg.w / this.staData.imgWhRatio;
            } else {
                this.tImg.style.width = 'auto';
                this.tImg.style.height = this.staData.originAreaW / this.staData.whRatio + 'px';
                this.staData.actualImg.h = this.staData.originAreaW / this.staData.whRatio;
                this.staData.actualImg.w = this.staData.actualImg.h * this.staData.imgWhRatio;
                
            }

            this.data.cut.w = 50;
            this.data.cut.h = this.data.cut.w / this.staData.whRatio;
            this.staData.cutPreviewRatio = this.data.cut.w / this.staData.preW;
            this.data.preImg.w = this.staData.actualImg.w / this.data.cut.w * this.staData.preW;
            this.data.preImg.h = this.data.preImg.w / this.staData.imgWhRatio;

            this.tImg.src = this.image.src;
            this.pImg.src = this.image.src;
            this.updateMouseRules(null);
            this.changeElement();
        }
    }
    //更新可移动的界限
    private updateMouseRules = (e : Event | null) => {
        if (this.tImg && this.isSelected.value) {
            const t = this.tImg.getBoundingClientRect();
                this.mouseData.rules.minX = t.left;
                this.mouseData.rules.maxX = t.left + this.staData.actualImg.w;
                this.mouseData.rules.minY = t.top;
                this.mouseData.rules.maxY = t.top + this.staData.actualImg.h; 
        }
        
    }
    //更新预览图片
    private changeElement = () => {
        this.data.preImg.w = this.staData.preW / (this.data.cut.w / this.staData.actualImg.w);
        this.data.preImg.h = this.data.preImg.w / this.staData.imgWhRatio;
        this.data.preImg.left = -this.data.cut.left / this.staData.actualImg.w * this.data.preImg.w;
        this.data.preImg.top = -this.data.cut.top / this.staData.actualImg.h * this.data.preImg.h;

        
        if (this.cFrame && this.pImg) {
            this.cFrame.style.width = this.data.cut.w + 'px';
            this.cFrame.style.height = this.data.cut.w / this.staData.whRatio + 'px';
            this.cFrame.style.left = this.data.cut.left + 'px';
            this.cFrame.style.top = this.data.cut.top + 'px';
            this.pImg.style.width = this.data.preImg.w + 'px';
            this.pImg.style.height = this.data.preImg.h + 'px';
            this.pImg.style.left =  this.data.preImg.left + 'px';
            this.pImg.style.top =  this.data.preImg.top + 'px';

        }

    }

    
    //是否允许移动
    allowMove = (e : MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.moveTarget = true;
        this.mouseData.x = e.clientX;
        this.mouseData.y = e.clientY;
        window.addEventListener('mouseup', this.stopMove);
        if (this.moveTarget) {
            window.addEventListener('mousemove', this.cutFrameMove);
        } 
        
    }

     //是否允许缩放
    allowScale = (e : MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.scaleTarget = true;
        this.staData.originCut.h = this.data.cut.h;
        this.staData.originCut.w = this.data.cut.w;
        this.staData.originCut.left = this.data.cut.left;
        this.staData.originCut.top = this.data.cut.top;
        this.verifyMouseArea(e);
        window.addEventListener('mouseup', this.stopMove);
        if (this.scaleTarget) {
            window.addEventListener('mousemove', this.cutFrameScale);
        } 
    }

    //缩放
    private cutFrameScale = (e : MouseEvent) => {
        if (!this.scaleTarget) return; 
        
        if (this.mouseData.curTarget === 4) {
            this.scaleRB(e.clientX, e.clientY);
        } else if (this.mouseData.curTarget === 3) {
            this.scaleLB(e.clientX, e.clientY);
        } else if (this.mouseData.curTarget === 2) {
            this.scaleRT(e.clientX, e.clientY);
        } else if (this.mouseData.curTarget === 1) {
            this.scaleLT(e.clientX, e.clientY);
        }
        this.verifyMouseArea(e);


        this.changeElement();
    }

    private verifyMouseArea = (e : MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;
        
        if (x + 3 > this.mouseData.rules.minX + this.staData.originCut.left + this.staData.originCut.w && y + 3 > this.mouseData.rules.minY + this.staData.originCut.top + this.staData.originCut.h) {
            this.mouseData.curTarget = 4;
        } else if (x - 3 < this.mouseData.rules.minX + this.staData.originCut.left && y + 3 > this.mouseData.rules.minY + this.staData.originCut.top + this.staData.originCut.h) {
            this.mouseData.curTarget = 3;
        } else if (x + 3 > this.mouseData.rules.minX + this.staData.originCut.left + this.staData.originCut.w && y - 3 < this.mouseData.rules.minY + this.staData.originCut.top) {
            this.mouseData.curTarget = 2;
        } else if (x - 3 < this.mouseData.rules.minX + this.staData.originCut.left && y - 3 < this.mouseData.rules.minY + this.staData.originCut.top) {
            this.mouseData.curTarget = 1;
        }    
        this.verticalChange(this.mouseData.curTarget, this.mouseData.oldTarget);
        
        if (this.mouseData.oldTarget !== this.mouseData.curTarget) {
            this.staData.originCut.h = this.data.cut.h;
            this.staData.originCut.w = this.data.cut.w;
            this.staData.originCut.left = this.data.cut.left;
            this.staData.originCut.top = this.data.cut.top;
        }
        
        this.mouseData.oldTarget = this.mouseData.curTarget;
    }

    //右下缩放
    private scaleRB = (x : number, y : number) => {
        //可移动的界限:
        const min = this.mouseData.rules.minX + this.staData.originCut.left;
        const max = this.mouseData.rules.maxX;
        const w = x - min;
        const h = w / this.staData.whRatio;
        if (h + this.staData.originCut.top >= this.staData.actualImg.h) return undefined;
        if (x >= min && x <= max) {
            this.data.cut.w = w;
            this.data.cut.h = h;
        } else if (x > max) {
            this.data.cut.w = h + this.staData.originCut.top > this.staData.actualImg.h ? (this.staData.actualImg.h - this.staData.originCut.top) * this.staData.whRatio : this.staData.actualImg.w - this.staData.originCut.left;
            this.data.cut.h = this.data.cut.w / this.staData.whRatio;
        } else if (x < min) {
            this.data.cut.w = 0;
            this.data.cut.h = 0;
        }
    }
    private scaleLB = (x : number, y : number) => {
        const min = this.mouseData.rules.minX;
        const max = this.mouseData.rules.minX + this.staData.originCut.left + this.staData.originCut.w;
        const w = max - x;
        const h = w / this.staData.whRatio;
        if (h + this.staData.originCut.top >= this.staData.actualImg.h) return undefined;
        if (x >= min && x <= max) {
            this.data.cut.left -= w - this.data.cut.w;
            this.data.cut.w = w;
            this.data.cut.h = h;
        } else if (x > max){
            this.data.cut.w = 0;
            this.data.cut.h = 0;
            this.data.cut.left = this.staData.originCut.left + this.staData.originCut.w;
        } else if (x < min) {
            this.data.cut.w = h + this.staData.originCut.top > this.staData.actualImg.h ? (this.staData.actualImg.h - this.staData.originCut.top) * this.staData.whRatio : this.staData.originCut.left + this.staData.originCut.w;
            this.data.cut.h = this.data.cut.w / this.staData.whRatio;
            this.data.cut.left = 0;
        }
    }
    private scaleLT = (x : number, y : number) => {
        const min = this.mouseData.rules.minX;
        const max = this.mouseData.rules.minX + this.staData.originCut.left + this.staData.originCut.w;
        const w = max - x;
        const h = w / this.staData.whRatio;
        const l = this.staData.originCut.left + this.staData.originCut.w - w;
        const t = this.staData.originCut.top + this.staData.originCut.h - h;

        if (t < 0) return undefined;
        if (x >= min && x <= max) {
            this.data.cut.left -= w - this.data.cut.w;
            this.data.cut.top -= h - this.data.cut.h;
            this.data.cut.h = h;
            this.data.cut.w = w;
        } else if (x < min) {
            this.data.cut.w = this.staData.originCut.w + this.staData.originCut.left;
            this.data.cut.h = this.data.cut.w / this.staData.whRatio;
            this.data.cut.left = 0;
            this.data.cut.top = this.staData.originCut.h + this.staData.originCut.top - this.data.cut.h;
        } else if (x > max) {
            this.data.cut.w = 0;
            this.data.cut.h = 0;
            this.data.cut.left = this.staData.originCut.left + this.staData.originCut.w;
            this.data.cut.top = this.staData.originCut.top + this.staData.originCut.h;
        }
    }
    private scaleRT = (x : number, y : number) => {
        const min = this.mouseData.rules.minX + this.staData.originCut.left;
        const max = this.mouseData.rules.maxX;
        const w = x - min;
        const h = w / this.staData.whRatio;
        const t = this.staData.originCut.top + this.staData.originCut.h - h;
        if (t < 0) return undefined;
        if (x >= min && x <= max) {
            this.data.cut.top -= h - this.data.cut.h;
            this.data.cut.h = h;
            this.data.cut.w = w;
        } else if (x < min) {
            this.data.cut.w = 0;
            this.data.cut.h = 0;
            this.data.cut.top = this.staData.originCut.top + this.staData.originCut.h;
        } else if (x > max) {
            this.data.cut.w = this.staData.actualImg.w - this.staData.originCut.left;
            this.data.cut.h = this.data.cut.w / this.staData.whRatio;
            this.data.cut.top = this.staData.originCut.h + this.staData.originCut.top - this.data.cut.h;
        }
        
    }
    // 上下切换
    private verticalChange = (newVal : number, oldVal : number) => {
        //从下到上
        if ((newVal === 1 && oldVal === 3) || (newVal === 2 && oldVal === 4)) {
            const top = this.data.cut.top - this.data.cut.h;
            if (newVal === 1) {
                if (top < 0) {
                    this.data.cut.left += this.data.cut.w -( this.data.cut.top * this.staData.whRatio);
                    this.data.cut.h = this.data.cut.top;
                    this.data.cut.top = 0;
                    this.data.cut.w = this.data.cut.h * this.staData.whRatio;
                } else {
                    this.data.cut.top = top;
                }
            } else {
                if (top < 0) {
                    this.data.cut.h = this.data.cut.top;
                    this.data.cut.top = 0;
                    this.data.cut.w = this.data.cut.h * this.staData.whRatio;
                } else {
                    this.data.cut.top = top;
                }
            }
        }
        //从上到下
        if ((newVal === 3 && oldVal === 1) || (newVal === 4 && oldVal === 2)) {
            const top = this.data.cut.h * 2 + this.data.cut.top;
            if (newVal === 3) {
                if (top > this.staData.actualImg.h) {
                    this.data.cut.top = this.data.cut.top + this.data.cut.h;
                    this.data.cut.h += this.staData.actualImg.h - this.data.cut.top - this.data.cut.h;
                    this.data.cut.left += (this.data.cut.w - this.data.cut.h * this.staData.whRatio);
                    this.data.cut.w = this.data.cut.h * this.staData.whRatio;
                } else {
                    this.data.cut.top += this.data.cut.h;
                }
            } else {
                if (top > this.staData.actualImg.h) {
                    this.data.cut.top = this.data.cut.top + this.data.cut.h;
                    this.data.cut.h += this.staData.actualImg.h - this.data.cut.top - this.data.cut.h;
                    this.data.cut.w = this.data.cut.h * this.staData.whRatio;
                } else {
                    this.data.cut.top += this.data.cut.h;
                }
            }
        }

        
    }

    //停止移动
    private stopMove = () => {
        if (this.moveTarget) {
            window.removeEventListener('mousemove', this.cutFrameMove);
        } 
        if (this.scaleTarget) {
            window.removeEventListener('mousemove', this.cutFrameScale);
        }
        window.removeEventListener('mouseup', this.stopMove);
        this.moveTarget = false;
        this.scaleTarget = false;
        this.mouseData.curTarget = 0;
        this.mouseData.oldTarget = 0;
    }

    //裁剪框移动
    private cutFrameMove = (e : MouseEvent) => {
        if (this.moveTarget) {
            const offsetY = e.clientY - this.mouseData.y;
            const offsetX = e.clientX - this.mouseData.x;
            this.data.cut.top += offsetY;
            this.data.cut.left += offsetX;    

            this.mouseData.x = e.clientX;
            this.mouseData.y = e.clientY;

            this.mouseData.x = this.mouseData.x <= this.mouseData.rules.minX + this.data.cut.w / 2 ? this.mouseData.rules.minX + this.data.cut.w / 2 : this.mouseData.x;
            this.mouseData.x = this.mouseData.x >= this.mouseData.rules.maxX - this.data.cut.w / 2 ? this.mouseData.rules.maxX - this.data.cut.w / 2 : this.mouseData.x;
            this.mouseData.y = this.mouseData.y <= this.mouseData.rules.minY + this.data.cut.h / 2 ? this.mouseData.rules.minY + this.data.cut.h / 2 : this.mouseData.y;
            this.mouseData.y = this.mouseData.y >= this.mouseData.rules.maxY - this.data.cut.h / 2 ? this.mouseData.rules.maxY - this.data.cut.h / 2 : this.mouseData.y;
            this.verifyCutArea();
            this.changeElement();
        }
    }

    //检查裁剪框位置是否超出界限
    private verifyCutArea = () => {
        this.data.cut.left = this.data.cut.left >= this.staData.actualImg.w - this.data.cut.w ? this.staData.actualImg.w - this.data.cut.w : this.data.cut.left;
        this.data.cut.top = this.data.cut.top >= this.staData.actualImg.h - this.data.cut.h ? this.staData.actualImg.h - this.data.cut.h : this.data.cut.top;
        this.data.cut.left = this.data.cut.left <= 0 ? 0 : this.data.cut.left;
        this.data.cut.top = this.data.cut.top <= 0 ? 0 : this.data.cut.top;
        
    }

    //获取属性
    setProps = (...args : any) => {
        [ this.staData.originAreaW, this.staData.whRatio, this.staData.preW ] = args;
        return this._this;
        
    }

    setId = (tImg : string, pImg : string, cFrame : string) => {
        onMounted(() => {
            window.addEventListener('resize', this.updateMouseRules);
            window.addEventListener('scroll', this.updateMouseRules);
            this.tImg = document.getElementById(tImg) as HTMLImageElement;
            this.pImg = document.getElementById(pImg) as HTMLImageElement;
            this.cFrame = document.getElementById(cFrame) as HTMLDivElement;
        })
        onUnmounted(() => {
            window.removeEventListener('resize', this.updateMouseRules);
            window.removeEventListener('scroll', this.updateMouseRules);
        })
    
        return this._this;
    }
    getSelectStatus = () => {
        return this.isSelected;
    }

    private _this = {
        setProp : this.setProps,
        setId : this.setId,
        getSelectStatus : this.getSelectStatus
    }
}








export default CutImg;

