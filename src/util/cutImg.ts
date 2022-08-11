import { onMounted, onUnmounted, reactive, ref, type Ref } from "vue";

interface data {
    cut : {
        w : number,
        h : number,
        top : number,
        left : number
    },
    preImg : {
        w : number,
        h : number,
        top : number,import { onMounted, onUnmounted, reactive, ref, type Ref } from "vue";

interface data {
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

const image : HTMLImageElement = new Image(); // 存放上传的图片
const reader : FileReader = new FileReader();  //  读取图片

let tImg : Ref<HTMLImageElement | undefined>;     //目标图片
let pImg : Ref<HTMLImageElement | undefined>;     //预览图片
let cFrame : Ref<HTMLDivElement | undefined>;    //裁剪框

const isSelected = ref<boolean>(false);
const data : data = {
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
const staData = {
    originImg : {
        w : 0,
        h : 0
    },
    actualImg : {
        w : 0,
        h : 0
    },
    originCut : {
        w : 0,
        h : 0,
        left : 0,
        top : 0
    },
    originAreaW : 0,
    preW : 0,
    imgWhRatio : 0,     //图片的宽高比
    whRatio : 0,        //裁剪框的宽高比
    cutPreviewRatio : 0,      //裁剪框与预览框的大小比
    h : 0
}
const mouseData = {
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

let moveTarget : boolean = false;
let scaleTarget : boolean = false;

//已选择图片
const selected = (e:Event) => {
    const file = e.target?.files[0];
    if (file == null) return;
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        image.src = String(reader.result);
        isSelected.value = true;
        image.onload = () => {
            //保存图片的原始大小 
            staData.originImg.w = image.width;
            staData.originImg.h = image.height;
            staData.imgWhRatio = staData.originImg.w / staData.originImg.h;
            //初始化
            init();
        }
    }

}

//初始化裁剪框和预览框
const init = () => {
    if (tImg.value && pImg.value && isSelected.value) {
        
        if (staData.originImg.w > staData.originImg.h) {
            tImg.value.style.width = staData.originAreaW + 'px';
            tImg.value.style.height = 'auto';
            staData.actualImg.w = staData.originAreaW;
            staData.actualImg.h = staData.actualImg.w / staData.imgWhRatio;
        } else {
            tImg.value.style.width = 'auto';
            tImg.value.style.height = staData.originAreaW / staData.whRatio + 'px';
            staData.actualImg.h = staData.originAreaW / staData.whRatio;
            staData.actualImg.w = staData.actualImg.h * staData.imgWhRatio;
            
        }

        data.cut.w = 50;
        data.cut.h = data.cut.w / staData.whRatio;
        staData.cutPreviewRatio = data.cut.w / staData.preW;
        data.preImg.w = staData.actualImg.w / data.cut.w * staData.preW;
        data.preImg.h = data.preImg.w / staData.imgWhRatio;

        tImg.value.src = image.src;
        pImg.value.src = image.src;
        updateMouseRules(null);
        changeElement();
    }
}

//更新可移动的界限
const updateMouseRules = (e : Event | null) => {
    if (tImg.value && isSelected.value) {
        const t = tImg.value.getBoundingClientRect();
            mouseData.rules.minX = t.left;
            mouseData.rules.maxX = t.left + staData.actualImg.w;
            mouseData.rules.minY = t.top;
            mouseData.rules.maxY = t.top + staData.actualImg.h; 
    }
    
}
//更新预览图片
const changeElement = () => {
    data.preImg.w = staData.preW / (data.cut.w / staData.actualImg.w);
    data.preImg.h = data.preImg.w / staData.imgWhRatio;
    data.preImg.left = -data.cut.left / staData.actualImg.w * data.preImg.w;
    data.preImg.top = -data.cut.top / staData.actualImg.h * data.preImg.h;

    
    if (cFrame.value && pImg.value) {
        cFrame.value.style.width = data.cut.w + 'px';
        cFrame.value.style.height = data.cut.w / staData.whRatio + 'px';
        cFrame.value.style.left = data.cut.left + 'px';
        cFrame.value.style.top = data.cut.top + 'px';
        pImg.value.style.width = data.preImg.w + 'px';
        pImg.value.style.height = data.preImg.h + 'px';
        pImg.value.style.left =  data.preImg.left + 'px';
        pImg.value.style.top =  data.preImg.top + 'px';

    }

}

//是否允许移动
const allowMove = (e : MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveTarget = true;
    mouseData.x = e.clientX;
    mouseData.y = e.clientY;
    window.addEventListener('mouseup', stopMove);
    if (moveTarget) {
        window.addEventListener('mousemove', cutFrameMove);
    } 
    
}

//是否允许缩放
const allowScale = (e : MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scaleTarget = true;
    staData.originCut.h = data.cut.h;
    staData.originCut.w = data.cut.w;
    staData.originCut.left = data.cut.left;
    staData.originCut.top = data.cut.top;
    verifyMouseArea(e);
    window.addEventListener('mouseup', stopMove);
    if (scaleTarget) {
        window.addEventListener('mousemove', cutFrameScale);
    } 
}
//缩放
const cutFrameScale = (e : MouseEvent) => {
    if (!scaleTarget) return; 
    
    if (mouseData.curTarget === 4) {
        scaleRB(e.clientX, e.clientY);
    } else if (mouseData.curTarget === 3) {
        scaleLB(e.clientX, e.clientY);
    } else if (mouseData.curTarget === 2) {
        scaleRT(e.clientX, e.clientY);
    } else if (mouseData.curTarget === 1) {
        scaleLT(e.clientX, e.clientY);
    }
    verifyMouseArea(e);


    changeElement();
}
const verifyMouseArea = (e : MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    if (x + 3 > mouseData.rules.minX + staData.originCut.left + staData.originCut.w && y + 3 > mouseData.rules.minY + staData.originCut.top + staData.originCut.h) {
        mouseData.curTarget = 4;
    } else if (x - 3 < mouseData.rules.minX + staData.originCut.left && y + 3 > mouseData.rules.minY + staData.originCut.top + staData.originCut.h) {
        mouseData.curTarget = 3;
    } else if (x + 3 > mouseData.rules.minX + staData.originCut.left + staData.originCut.w && y - 3 < mouseData.rules.minY + staData.originCut.top) {
        mouseData.curTarget = 2;
    } else if (x - 3 < mouseData.rules.minX + staData.originCut.left && y - 3 < mouseData.rules.minY + staData.originCut.top) {
        mouseData.curTarget = 1;
    }    
    verticalChange(mouseData.curTarget, mouseData.oldTarget);
    
    if (mouseData.oldTarget !== mouseData.curTarget) {
        staData.originCut.h = data.cut.h;
        staData.originCut.w = data.cut.w;
        staData.originCut.left = data.cut.left;
        staData.originCut.top = data.cut.top;
    }
    
    mouseData.oldTarget = mouseData.curTarget;
}
//右下缩放
const scaleRB = (x : number, y : number) => {
    //可移动的界限:
    const min = mouseData.rules.minX + staData.originCut.left;
    const max = mouseData.rules.maxX;
    const w = x - min;
    const h = w / staData.whRatio;
    if (h + staData.originCut.top >= staData.actualImg.h) return undefined;
    if (x >= min && x <= max) {
        data.cut.w = w;
        data.cut.h = h;
    } else if (x > max) {
        data.cut.w = h + staData.originCut.top > staData.actualImg.h ? (staData.actualImg.h - staData.originCut.top) * staData.whRatio : staData.actualImg.w - staData.originCut.left;
        data.cut.h = data.cut.w / staData.whRatio;
    } else if (x < min) {
        data.cut.w = 0;
        data.cut.h = 0;
    }
}
const scaleLB = (x : number, y : number) => {
     const min = mouseData.rules.minX;
    const max = mouseData.rules.minX + staData.originCut.left + staData.originCut.w;
    const w = max - x;
    const h = w / staData.whRatio;
    if (h + staData.originCut.top >= staData.actualImg.h) return undefined;
    if (x >= min && x <= max) {
        data.cut.left -= w - data.cut.w;
        data.cut.w = w;
        data.cut.h = h;
    } else if (x > max){
        data.cut.w = 0;
        data.cut.h = 0;
        data.cut.left = staData.originCut.left + staData.originCut.w;
    } else if (x < min) {
        data.cut.w = h + staData.originCut.top > staData.actualImg.h ? (staData.actualImg.h - staData.originCut.top) * staData.whRatio : staData.originCut.left + staData.originCut.w;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.left = 0;
    }
}
const scaleLT = (x : number, y : number) => {
    const min = mouseData.rules.minX;
    const max = mouseData.rules.minX + staData.originCut.left + staData.originCut.w;
    const w = max - x;
    const h = w / staData.whRatio;
    const l = staData.originCut.left + staData.originCut.w - w;
    const t = staData.originCut.top + staData.originCut.h - h;

    if (t < 0) return undefined;
    if (x >= min && x <= max) {
        data.cut.left -= w - data.cut.w;
        data.cut.top -= h - data.cut.h;
        data.cut.h = h;
        data.cut.w = w;
    } else if (x < min) {
        data.cut.w = staData.originCut.w + staData.originCut.left;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.left = 0;
        data.cut.top = staData.originCut.h + staData.originCut.top - data.cut.h;
    } else if (x > max) {
        data.cut.w = 0;
        data.cut.h = 0;
        data.cut.left = staData.originCut.left + staData.originCut.w;
        data.cut.top = staData.originCut.top + staData.originCut.h;
    }
}
const scaleRT = (x : number, y : number) => {
    const min = mouseData.rules.minX + staData.originCut.left;
    const max = mouseData.rules.maxX;
    const w = x - min;
    const h = w / staData.whRatio;
    const t = staData.originCut.top + staData.originCut.h - h;
    if (t < 0) return undefined;
    if (x >= min && x <= max) {
        data.cut.top -= h - data.cut.h;
        data.cut.h = h;
        data.cut.w = w;
    } else if (x < min) {
        data.cut.w = 0;
        data.cut.h = 0;
        data.cut.top = staData.originCut.top + staData.originCut.h;
    } else if (x > max) {
        data.cut.w = staData.actualImg.w - staData.originCut.left;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.top = staData.originCut.h + staData.originCut.top - data.cut.h;
    }
    
}


// 上下切换
const verticalChange = (newVal : number, oldVal : number) => {
    //从下到上
    if ((newVal === 1 && oldVal === 3) || (newVal === 2 && oldVal === 4)) {
        const top = data.cut.top - data.cut.h;
        if (newVal === 1) {
            if (top < 0) {
                data.cut.left += data.cut.w -( data.cut.top * staData.whRatio);
                data.cut.h = data.cut.top;
                data.cut.top = 0;
                data.cut.w = data.cut.h * staData.whRatio;
            } else {
                data.cut.top = top;
            }
        } else {
            if (top < 0) {
                data.cut.h = data.cut.top;
                data.cut.top = 0;
                data.cut.w = data.cut.h * staData.whRatio;
            } else {
                data.cut.top = top;
            }
        }
    }
    //从上到下
    if ((newVal === 3 && oldVal === 1) || (newVal === 4 && oldVal === 2)) {
        const top = data.cut.h * 2 + data.cut.top;
        if (newVal === 3) {
            if (top > staData.actualImg.h) {
                data.cut.top = data.cut.top + data.cut.h;
                data.cut.h += staData.actualImg.h - data.cut.top - data.cut.h;
                data.cut.left += (data.cut.w - data.cut.h * staData.whRatio);
                data.cut.w = data.cut.h * staData.whRatio;
            } else {
                data.cut.top += data.cut.h;
            }
        } else {
            if (top > staData.actualImg.h) {
                data.cut.top = data.cut.top + data.cut.h;
                data.cut.h += staData.actualImg.h - data.cut.top - data.cut.h;
                data.cut.w = data.cut.h * staData.whRatio;
            } else {
                data.cut.top += data.cut.h;
            }
        }
    }

    
}


//停止移动
const stopMove = () => {
    if (moveTarget) {
        window.removeEventListener('mousemove', cutFrameMove);
    } 
    if (scaleTarget) {
        window.removeEventListener('mousemove', cutFrameScale);
    }
    window.removeEventListener('mouseup', stopMove);
    moveTarget = false;
    scaleTarget = false;
    mouseData.curTarget = 0;
    mouseData.oldTarget = 0;
}

//裁剪框移动
const cutFrameMove = (e : MouseEvent) => {
    if (moveTarget) {
        const offsetY = e.clientY - mouseData.y;
        const offsetX = e.clientX - mouseData.x;
        data.cut.top += offsetY;
        data.cut.left += offsetX;    

        mouseData.x = e.clientX;
        mouseData.y = e.clientY;

        mouseData.x = mouseData.x <= mouseData.rules.minX + data.cut.w / 2 ? mouseData.rules.minX + data.cut.w / 2 : mouseData.x;
        mouseData.x = mouseData.x >= mouseData.rules.maxX - data.cut.w / 2 ? mouseData.rules.maxX - data.cut.w / 2 : mouseData.x;
        mouseData.y = mouseData.y <= mouseData.rules.minY + data.cut.h / 2 ? mouseData.rules.minY + data.cut.h / 2 : mouseData.y;
        mouseData.y = mouseData.y >= mouseData.rules.maxY - data.cut.h / 2 ? mouseData.rules.maxY - data.cut.h / 2 : mouseData.y;
        verifyCutArea();
        changeElement();
    }
}

//检查裁剪框位置是否超出界限
const verifyCutArea = () => {
    data.cut.left = data.cut.left >= staData.actualImg.w - data.cut.w ? staData.actualImg.w - data.cut.w : data.cut.left;
    data.cut.top = data.cut.top >= staData.actualImg.h - data.cut.h ? staData.actualImg.h - data.cut.h : data.cut.top;
    data.cut.left = data.cut.left <= 0 ? 0 : data.cut.left;
    data.cut.top = data.cut.top <= 0 ? 0 : data.cut.top;
    
}

const useCutImg = () => {
    onMounted(() => {
        window.addEventListener('resize', updateMouseRules);
        window.addEventListener('scroll', updateMouseRules);
    })
    onUnmounted(() => {
        window.removeEventListener('resize', updateMouseRules);
        window.removeEventListener('scroll', updateMouseRules);
    })

    return _this;
}
//获取虚拟Dom
const setVDom = (tarImg : Ref<HTMLImageElement | undefined>, preImg : Ref<HTMLImageElement | undefined>, cutFrame : Ref<HTMLDivElement | undefined>) => {
    if (tarImg && preImg && cutFrame) {
        tImg = tarImg;
        pImg = preImg;
        cFrame = cutFrame;
    }

    return _this;
}
//获取属性
const setProps = (...args : any) => {
    [ staData.originAreaW, staData.whRatio, staData.preW ] = args;
    return _this;
    
}
const getSelectStatus = () => {
    return {
        isSelected : isSelected,
        data : data
    }
};

const _this = {
    setProps : setProps,
    setVnode : setVDom,
    getSelectStatus : getSelectStatus
}
export {
    selected,
    useCutImg,
    allowMove,
    allowScale
} 
        left : number
    }
}

const image : HTMLImageElement = new Image(); // 存放上传的图片
const reader : FileReader = new FileReader();  //  读取图片

let tImg : Ref<HTMLImageElement | undefined>;     //目标图片
let pImg : Ref<HTMLImageElement | undefined>;     //预览图片

const isSelected = ref<boolean>(false);
const data = reactive<data>({
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
})
const staData = {
    originImg : {
        w : 0,
        h : 0
    },
    actualImg : {
        w : 0,
        h : 0
    },
    originAreaW : 0,
    preW : 0,
    imgWhRatio : 0,     //图片的宽高比
    whRatio : 0,        //裁剪框的宽高比
    cutPreviewRatio : 0,      //裁剪框与预览框的大小比
    cut : {
        x : 0,
        w : -1,
        y : 0,
        h : -1
    }
}
const mouseData = {
    x : 0,
    y : 0,
    rules : {
        maxX : 0,
        minX : 0,
        minY : 0,
        maxY :0
    },
    target : 0,    //记录指针的象限
    tatgetTemp : 0 //保存上一次的值
}

let moveTarget : boolean = false;
let scaleTarget : boolean = false;

//已选择图片
const selected = (e:Event) => {
    const file = e.target?.files[0];
    if (file == null) return;
    reader.readAsDataURL(file);
    reader.onloadend = () => {
        image.src = String(reader.result);
        isSelected.value = true;
        image.onload = () => {
            //保存图片的原始大小 
            staData.originImg.w = image.width;
            staData.originImg.h = image.height;
            staData.imgWhRatio = staData.originImg.w / staData.originImg.h;
            //初始化
            init();
        }
    }

}

//初始化裁剪框和预览框
const init = () => {
    if (tImg.value && pImg.value && isSelected.value) {
        
        if (staData.originImg.w > staData.originImg.h) {
            tImg.value.style.width = staData.originAreaW + 'px';
            tImg.value.style.height = 'auto';
            staData.actualImg.w = staData.originAreaW;
            staData.actualImg.h = staData.actualImg.w / staData.imgWhRatio;
        } else {
            tImg.value.style.width = 'auto';
            tImg.value.style.height = staData.originAreaW / staData.whRatio + 'px';
            staData.actualImg.h = staData.originAreaW / staData.whRatio;
            staData.actualImg.w = staData.actualImg.h * staData.imgWhRatio;
            
        }

        data.cut.w = 50;
        data.cut.h = data.cut.w / staData.whRatio;
        staData.cutPreviewRatio = data.cut.w / staData.preW;
        data.preImg.w = staData.actualImg.w / data.cut.w * staData.preW;
        data.preImg.h = data.preImg.w / staData.imgWhRatio;

        tImg.value.src = image.src;
        pImg.value.src = image.src;
        updateMouseRules(null);
        changeElement();
    }
}

//更新可移动的界限
const updateMouseRules = (e : Event | null) => {
    if (tImg.value && isSelected.value) {
        const t = tImg.value.getBoundingClientRect();
            mouseData.rules.minX = t.left;
            mouseData.rules.maxX = t.left + staData.actualImg.w;
            mouseData.rules.minY = t.top;
            mouseData.rules.maxY = t.top + staData.actualImg.h; 
    }
    
}
//更新预览图片
const changeElement = () => {
    data.preImg.w = staData.preW / (data.cut.w / staData.actualImg.w);
    data.preImg.h = staData.preW / (data.cut.w / staData.actualImg.w) / staData.imgWhRatio;
    data.preImg.left = -data.cut.left / staData.actualImg.w * data.preImg.w;
    data.preImg.top = -data.cut.top / staData.actualImg.h * data.preImg.h;
}

//是否允许移动
const allowMove = (e : MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveTarget = true;
    mouseData.x = e.clientX;
    mouseData.y = e.clientY;
    window.addEventListener('mouseup', stopMove);
    if (moveTarget) {
        window.addEventListener('mousemove', cutFrameMove);
    } 
    
}

//是否允许缩放
const allowScale = (e : MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scaleTarget = true;
    staData.cut.x = data.cut.left;
    staData.cut.y = data.cut.top;
    verifyMouseArea(e);
    if (mouseData.target == 3 || mouseData.target == 1) {
        staData.cut.w = data.cut.w;   
    }
    if (mouseData.target == 1 || mouseData.target == 2) {
        staData.cut.h = data.cut.h;
    }
    window.addEventListener('mouseup', stopMove);
    if (scaleTarget) {
        window.addEventListener('mousemove', cutFrameScale);
    } 
}
//缩放
const cutFrameScale = (e : MouseEvent) => {
    if (!scaleTarget) return;
    if (e.clientX < e.clientY) return;
    
    verifyMouseArea(e);
    if (mouseData.target === 4) {
        scaleRB(e.clientX, e.clientY);
    } else if (mouseData.target === 3) {
        scaleLB(e.clientX, e.clientY);
    } else if (mouseData.target === 2) {
        scaleRT(e.clientX, e.clientY);
    } else if (mouseData.target === 1) {
        scaleLT(e.clientX, e.clientY);
    }
    changeElement();
}
const verifyMouseArea = (e : MouseEvent) => {
    if (e.clientX > mouseData.rules.minX + data.cut.left + data.cut.w && e.clientY > mouseData.rules.minY + data.cut.top + data.cut.h) {
        mouseData.target = 4;
    } else if (e.clientX <= mouseData.rules.minX + data.cut.left && e.clientY > mouseData.rules.minY + data.cut.top + data.cut.h) {
        mouseData.target = 3;
    } else if (e.clientX > mouseData.rules.minX + data.cut.left + data.cut.w && e.clientY < mouseData.rules.minY + data.cut.top) {
        mouseData.target = 2;
    } else if (e.clientX <= mouseData.rules.minX + data.cut.left && e.clientY < mouseData.rules.minY + data.cut.top) {
        mouseData.target = 1;
    } 
    console.log(mouseData.target);
    
    verticalChange(mouseData.target, mouseData.tatgetTemp);
    mouseData.tatgetTemp = mouseData.target;
}
//右下缩放
const scaleRB = (x : number, y : number) => {
    if (data.cut.h + data.cut.top >= staData.actualImg.h && x >= mouseData.rules.minX + data.cut.left + data.cut.w) {
        data.cut.h = staData.actualImg.h - data.cut.top;
        data.cut.w = data.cut.h * staData.whRatio;
        return undefined;
    } 
    if (x > mouseData.rules.maxX) {
        data.cut.left = staData.cut.w === -1 ? staData.cut.x : staData.cut.w + staData.cut.x;
        data.cut.w = staData.cut.w === -1 ? staData.actualImg.w - staData.cut.x : staData.actualImg.w - staData.cut.w - staData.cut.x;
        
    } else {
        data.cut.left = staData.cut.w === -1 ? staData.cut.x : staData.cut.w + staData.cut.x; 
        data.cut.w += x - mouseData.rules.minX - data.cut.left - data.cut.w;
        
    }
    
    data.cut.h = data.cut.w / staData.whRatio;

    
}
const scaleLB = (x : number, y : number) => {
    if (data.cut.h + data.cut.top >= staData.actualImg.h && x <= mouseData.rules.minX + data.cut.left) {
        data.cut.h = staData.actualImg.h - data.cut.top;
        data.cut.w = data.cut.h * staData.whRatio;
        return undefined;
    } 
    if (mouseData.rules.minX >= x) {
        data.cut.w = staData.cut.w == -1 ? staData.cut.x : staData.cut.w + staData.cut.x;
        data.cut.left = staData.cut.w == -1 ? 0 : staData.cut.w + staData.cut.x - data.cut.w;
    } else {
        data.cut.w -= x - mouseData.rules.minX - data.cut.left;
        data.cut.left += x - mouseData.rules.minX - data.cut.left;
    }

    data.cut.h = data.cut.w / staData.whRatio;
    
}
const scaleLT = (x : number, y : number) => {
    if (data.cut.top <= 0 && x <= mouseData.rules.minX + data.cut.left) {
        
        data.cut.h = staData.cut.h === -1 ? staData.cut.y : staData.cut.h + staData.cut.y;
        data.cut.w = data.cut.h * staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
        return undefined;
    }
    if (x <= mouseData.rules.minX) {
        data.cut.w = staData.cut.w == -1 ? staData.cut.x : staData.cut.w + staData.cut.x;
        data.cut.left = staData.cut.w == -1 ? 0 : staData.cut.w + staData.cut.x - data.cut.w;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
    } else {

        data.cut.w -= x - mouseData.rules.minX - data.cut.left;
        data.cut.left += x - mouseData.rules.minX - data.cut.left;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
    }
}
const scaleRT = (x : number, y : number) => {
    if (data.cut.top <= 0 && x >= mouseData.rules.minX + data.cut.left + data.cut.w) {
        
        data.cut.h = staData.cut.h === -1 ? staData.cut.y : staData.cut.h + staData.cut.y;
        data.cut.w = data.cut.h * staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
        return undefined;
    }
    if (x > mouseData.rules.maxX) {
        data.cut.left = staData.cut.w === -1 ? staData.cut.x : staData.cut.w + staData.cut.x;
        data.cut.w = staData.cut.w === -1 ? staData.actualImg.w - staData.cut.x : staData.actualImg.w - staData.cut.w - staData.cut.x;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
    } else {
        data.cut.left = staData.cut.w === -1 ? staData.cut.x : staData.cut.w + staData.cut.x; 
        data.cut.w += x - mouseData.rules.minX - data.cut.left - data.cut.w;
        data.cut.h = data.cut.w / staData.whRatio;
        data.cut.top = staData.cut.h === -1 ? staData.cut.y - data.cut.h : staData.cut.h + staData.cut.y - data.cut.h;
    }

}


// 上下切换
const verticalChange = (newVal : number, oldVal : number) => {
    
    if ((newVal == 1 || newVal == 2) && (oldVal == 3 || oldVal == 4)) {
        data.cut.h = data.cut.top - data.cut.h <= 0 ? data.cut.h - (data.cut.top - data.cut.h) : data.cut.h;
        data.cut.w = data.cut.h * staData.whRatio;
        data.cut.top -= data.cut.h;
    } else if ((newVal == 3 || newVal == 4) && (oldVal == 1 || oldVal == 2)) {
        data.cut.h -= data.cut.top * 2 + data.cut.top > staData.actualImg.h ? (data.cut.top * 2 + data.cut.top - staData.actualImg.h) / 2 : 0;
        data.cut.w = data.cut.h * staData.whRatio;
        data.cut.top += data.cut.h;
    }


}
//停止移动
const stopMove = () => {
    if (moveTarget) {
        window.removeEventListener('mousemove', cutFrameMove);
    } 
    if (scaleTarget) {
        window.removeEventListener('mousemove', cutFrameScale);
    }
    window.removeEventListener('mouseup', stopMove);
    moveTarget = false;
    scaleTarget = false;
    staData.cut.w = -1;
    mouseData.target = 0;
}

//裁剪框移动
const cutFrameMove = (e : MouseEvent) => {
    if (moveTarget) {
        const offsetY = e.clientY - mouseData.y;
        const offsetX = e.clientX - mouseData.x;
        data.cut.top += offsetY;
        data.cut.left += offsetX;    

        mouseData.x = e.clientX;
        mouseData.y = e.clientY;

        mouseData.x = mouseData.x <= mouseData.rules.minX + data.cut.w / 2 ? mouseData.rules.minX + data.cut.w / 2 : mouseData.x;
        mouseData.x = mouseData.x >= mouseData.rules.maxX - data.cut.w / 2 ? mouseData.rules.maxX - data.cut.w / 2 : mouseData.x;
        mouseData.y = mouseData.y <= mouseData.rules.minY + data.cut.h / 2 ? mouseData.rules.minY + data.cut.h / 2 : mouseData.y;
        mouseData.y = mouseData.y >= mouseData.rules.maxY - data.cut.h / 2 ? mouseData.rules.maxY - data.cut.h / 2 : mouseData.y;
        verifyCutArea();
        changeElement();
    }
}

//检查裁剪框位置是否超出界限
const verifyCutArea = () => {
    data.cut.left = data.cut.left >= staData.actualImg.w - data.cut.w ? staData.actualImg.w - data.cut.w : data.cut.left;
    data.cut.top = data.cut.top >= staData.actualImg.h - data.cut.h ? staData.actualImg.h - data.cut.h : data.cut.top;
    data.cut.left = data.cut.left <= 0 ? 0 : data.cut.left;
    data.cut.top = data.cut.top <= 0 ? 0 : data.cut.top;
    
}
const useCutImg = () => {
    onMounted(() => {
        window.addEventListener('resize', updateMouseRules);
        window.addEventListener('scroll', updateMouseRules);
    })
    onUnmounted(() => {
        window.removeEventListener('resize', updateMouseRules);
        window.removeEventListener('scroll', updateMouseRules);
    })

    return _this;
}
//获取虚拟Dom
const setVDom = (tarImg : Ref<HTMLImageElement | undefined>, preImg : Ref<HTMLImageElement | undefined>) => {
    if (tarImg && preImg) {
        tImg = tarImg;
        pImg = preImg;
    }

    return _this;
}
//获取属性
const setProps = (...args : any) => {
    [ staData.originAreaW, staData.whRatio, staData.preW ] = args;
    return _this;
    
}
const getSelectStatus = () => {
    return {
        isSelected : isSelected,
        data : data
    }
};

const _this = {
    setProps : setProps,
    setVnode : setVDom,
    getSelectStatus : getSelectStatus
}
export {
    selected,
    useCutImg,
    allowMove,
    allowScale
}
