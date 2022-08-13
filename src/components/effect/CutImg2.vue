<script setup lang="ts">
import CutImg from '@/util/CutImg1';

const props = defineProps<{
                preW : number,
                whRatio : number,
                isAvatar : boolean,
                cutBoxW : number,
                tarImg : string,
                preImg : string,
                cutFrame : string,
                isLight : boolean,
                customUploadBtn : boolean,
                imgMaxSize : number,
                imgMinSize : number
            }>();


const file : HTMLInputElement = document.createElement('input') as HTMLInputElement;
file.setAttribute('type','file');
file.setAttribute('accept','image/png,image/jpg,image/jpeg');

const reset = () => {
    
    file.click();
    file.onchange = () => {
        if (file.files && file.files[0]) {
            useCutImg.selected(file.files[0]); 
        } else {
            window.alert('(= . = )ブ 还没有上传图片啊。。。');
        }
    }
}

const useCutImg : CutImg = new CutImg();
const { isSelected, pixel, prompt, h, w, cuting } = useCutImg.setId(props.tarImg, props.preImg, props.cutFrame)
                            .setProp({
                                originW: props.cutBoxW,
                                preW: props.preW,
                                whRatio: props.whRatio,
                                files: {
                                    minSize: props.imgMinSize,
                                    maxSize: props.imgMaxSize,
                                    minW: 960,
                                    minH: 600,
                                }
                            }).getSelectStatus();




</script>


<template>
    <div class="container-cut">
        <!-- 未选择图片 -->
        <div class="no-select" v-if="!isSelected && !customUploadBtn" @click="reset()">
            <svg class="upload-icon" viewBox="0 0 1029 1024" xmlns="http://www.w3.org/2000/svg" width="36" height="36" :style="isLight ? {fill : 'rgb(140,140,140)'} : {fill : 'rgb(110,110,110)'}">
                <path d="M661.23 1003.042H119.672c-64.034 0-116.053-51.883-116.053-115.712V115.917C3.618 52.224 55.638 0.068 119.671 0.068H893.27c63.898 0 115.985 52.02 115.985 115.849v539.99c0 21.23-17.34 38.775-38.707 38.775s-38.912-17.34-38.912-38.776v-539.99c0-21.23-17.34-38.638-38.57-38.638H119.67c-21.299 0-38.912 17.408-38.912 38.639v771.14c0 21.231 17.613 38.639 38.912 38.639h541.492c21.162 0 38.707 17.203 38.707 38.639 0.068 21.3-17.545 38.707-38.64 38.707z"></path>
                <path d="M42.325 771.755c-9.762 0-19.729-4.028-27.238-11.606-14.95-14.95-14.95-39.458 0-54.408l192.785-192.034c35.157-35.158 89.156-44.169 133.803-21.777L551.39 596.65c14.814 7.578 32.768 4.643 44.373-7.167l347.614-346.317c14.95-15.019 39.458-15.019 54.682 0 15.223 14.882 15.087 39.39 0 54.545l-347.75 346.317c-35.09 35.089-88.816 43.759-133.667 21.367L306.86 561.084c-14.95-7.578-32.7-4.506-44.374 7.168L69.7 760.012c-7.51 7.578-17.34 11.743-27.375 11.743zM351.71 385.775c-63.898 0-116.053-51.746-116.053-115.712 0-63.898 51.882-115.712 116.053-115.712 63.76 0 116.053 51.883 116.053 115.712 0 63.898-52.36 115.712-116.053 115.712z m0-154.146c-21.163 0-38.776 17.271-38.776 38.502 0 21.368 17.477 38.64 38.776 38.64 21.163 0 38.639-17.272 38.639-38.64 0-21.23-17.34-38.502-38.64-38.502zM834.833 1024c-21.367 0-38.844-17.203-38.844-38.775V753.869c0-21.095 17.204-38.64 38.844-38.64 21.163 0 38.776 17.34 38.776 38.64v231.356c-0.069 21.572-17.545 38.775-38.776 38.775z"></path>
                <path d="M989.389 868.284c-9.49 0-18.978-3.345-26.76-10.377l-127.864-120.15-128.478 120.15c-15.36 14.404-39.8 13.858-54.409-1.57-14.677-15.633-13.994-39.868 1.707-54.682L788.89 674.611c11.127-13.721 27.58-21.436 45.533-21.436 17.818 0 34.27 7.988 45.261 21.436l135.441 127.044c15.702 14.814 16.52 38.912 1.775 54.682-6.758 7.782-17.066 11.947-27.511 11.947z"></path>
            </svg>
            <div class="no-select-mask" :style="isLight ? {background : 'rgb(200,200,200)'} : {background : 'rgb(49, 53, 60)'}"></div>
            <span :style="isLight ? {color : 'rgb(50,50,50)'} : {color : 'rgb(150,150,150)'}">选择本地图片</span>
        </div>
        <!-- 自定义上传按钮 -->
        <div class="slot" v-if="!isSelected && customUploadBtn" @click="reset()" style="margin-left : 20px">
            <slot></slot>
        </div>
        <!-- 已选择图片 -->
        <div v-show="isSelected">
                       
            <div class="cut-box"  :style="{width : cutBoxW + 'px', height : (cutBoxW) / whRatio + 'px'}">
                <!-- 上传的图片 -->
                <div :style="{maxWidth : cutBoxW + 'px', maxHeight : cutBoxW / whRatio + 'px'}">
                    <img class="upload-img" :id="tarImg">
                    <div class="cut-mask" ></div>
                    <div :id="cutFrame" class="cut" @mousedown="useCutImg.allowMove($event)">
                        <span ref="rb" class="cut-scale-rb" @mousedown="useCutImg.allowScale($event)"></span>
                        <span ref="lb" class="cut-scale-lb" @mousedown="useCutImg.allowScale($event)"></span>
                        <span ref="rt" class="cut-scale-rt" @mousedown="useCutImg.allowScale($event)"></span>
                        <span ref="lt" class="cut-scale-lt" @mousedown="useCutImg.allowScale($event)"></span>
                    </div>
                </div>

            </div>
            <div :style="{display : 'flex', marginTop : '5px',width : cutBoxW + 'px', justifyContent:'space-between'}">
                <!-- 重新选择文件 -->
                <div class="selected-upload" @click="reset()">
                    <svg class="icon" viewBox="0 0 1024 1024" width="15" height="15" :style="isLight ? {fill : '#8a8a8a'} : {fill : 'rgb(190,190,190)'}">
                        <path d="M1017.576727 326.493091l-87.226182 151.272727c0.256 3.677091 0.558545 7.284364 0.558546 10.961455h-6.842182a46.545455 46.545455 0 0 1-28.392727 21.736727h-0.395637a46.289455 46.289455 0 0 1-8.424727 1.419636h-2.327273a29.137455 29.137455 0 0 1-11.264-1.210181c-1.466182-0.325818-2.955636-0.512-4.398545-1.000728a46.685091 46.685091 0 0 1-8.634182-3.886545l-161.908363-93.626182a46.801455 46.801455 0 0 1 46.731636-81.082182l70.842182 40.96A325.352727 325.352727 0 0 0 217.949091 349.090909H209.454545a46.545455 46.545455 0 1 1-78.08-34.048 417.861818 417.861818 0 0 1 771.048728 23.994182l34.210909-59.345455a46.754909 46.754909 0 1 1 80.942545 46.801455z m-124.951272 382.464a417.838545 417.838545 0 0 1-771.048728-23.994182l-34.210909 59.345455A46.778182 46.778182 0 1 1 6.4 697.483636l87.249455-151.272727C93.393455 542.557091 93.090909 538.949818 93.090909 535.272727h6.842182a46.545455 46.545455 0 0 1 28.369454-21.736727h0.395637A47.104 47.104 0 0 1 137.146182 512h2.327273a29.137455 29.137455 0 0 1 11.264 1.210182c1.466182 0.325818 2.955636 0.512 4.398545 1.000727a46.685091 46.685091 0 0 1 8.634182 3.886546l161.908363 93.626181a46.801455 46.801455 0 0 1-46.731636 81.082182l-70.842182-40.96A325.352727 325.352727 0 0 0 806.050909 674.909091H814.545455a46.545455 46.545455 0 1 1 78.08 34.048z"></path>
                    </svg>
                    <span :style="isLight ? {color : 'rgb(50,50,50)'} : {color : 'rgb(190,190,190)'}">选择文件</span>
            
                </div>
                <!-- 显示图片预期大小 -->
                <span v-if="!isAvatar" class="px" :style="isLight ? {color : 'rgb(50,50,50)'} : {color : 'rgb(190,190,190)'}">当前分辨率：<span :style="pixel.w > 960 ? { color : '#10B98195' } : { color : '#EF444495' }">{{ pixel.w }}*{{ pixel.h }}</span>, 最终分辨率需要大于960*600</span>
            </div>
        </div>
        <!-- 预览 -->
        <div class="preview" v-show="isAvatar || isSelected">
            <!-- 图片 -->
            <div class="p-avatar">
                <div class="a-img-mask" :class="isLight ? 'a-img-mask-light' : 'a-img-mask-dark'" :style="isAvatar ? {borderRadius : '50%', width : preW + 'px', height : preW + 'px'} : {borderRadius : '5px', width : preW + 'px', height : preW / whRatio + 'px'}">
                    <img :id="preImg" src="@/assets/222.jpg" alt=" "/>
                </div>
                <p v-if="!isAvatar" :style="isLight ? {color : 'rgb(50,50,50)'} : {color : 'rgb(190,190,190)'}">预览图片</p>
                <p v-if="isAvatar" :style="isLight ? {color : 'rgb(50,50,50)'} : {color : 'rgb(190,190,190)'}">{{ !isSelected ? '当前头像' : '预览头像' }}</p>
                <div v-if="isSelected" class="submit" :style="isLight ? {background : 'rgb(56, 155, 243)'} : {background : 'rgb(47, 110, 165)'}">
                    <span :style="isLight ? {color : 'white'} : {color : 'rgb(200,200,200)'}" @click="useCutImg.ok(pixel.w, pixel.h, isAvatar)">{{ cuting ? '正在裁剪' : '确定裁剪' }}</span>
                </div>
            </div>
        </div>

    </div>
</template>


<style scoped>

    .container-cut {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
    }

    .slot {
        position: relative;
        width: max-content;
        height: max-content;
    }
    .no-select {
        position: relative;
        width: 180px;
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        overflow: hidden;
        margin-right: 30px;
        cursor: pointer;
    }
    .no-select > span {
        position: absolute;
        bottom: 10%;
        font-size: 0.875rem;
        letter-spacing: 0.1rem;
    } 

    .select-img-btn {
        position: absolute;
        width: 100%;
        height: 100%;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        z-index: 1;
    }

     .no-select-mask {
        position: absolute;
        transition: all 0.3s;
        z-index: -1;
        width: 100%;
        height: 100%;
    }
    .no-select:hover > .no-select-mask {
        background: rgba(90, 90, 98, 0.5) !important;
    } 

    .upload-icon {
        position: absolute;
        top: 15%;

    }

    .preview {
        position: relative;
        width: max-content;
        height: max-content;
        overflow: hidden;   
        padding-left: 50px;
        border-left: solid rgba(132, 132, 132, 0.7) 1px;
    }

    .p-avatar {
        position: relative;
        width: max-content;
        height: max-content;
        transition: all 0.3s;
        overflow: hidden;
    }
    .a-img-mask {
        position: relative;
        left: 50%;
        border: solid rgba(105, 105, 105, 0) 2px;
        transform: translateX(-50%); 
        overflow: hidden;
    }
    .p-avatar > p {
        position: relative;
        width: max-content;
        display: inline-block;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        margin-bottom: 20px;
    }
    .a-img-mask-dark {
        border: solid rgba(132, 132, 132, 0.7) 2px;
        background-color: rgba(132, 132, 132, 0.7);
    }
    .a-img-mask-light {
        border: solid rgb(46, 130, 233) 2px;
        background-color: rgb(46, 130, 233);
    }
    .a-img-mask > img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        -webkit-user-drag: none;
        user-select: none;
    }


    .cut-box {
        position: relative;
        background-color: black;
        margin-right: 40px;
        -webkit-user-drag: none;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        overflow: hidden;
    }
    .cut-box > div {
        position: relative;
        width: min-content;
        height: min-content;
    }
    .cut-mask {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-user-drag: none;
    }

    .cut {
        position: absolute;
        width: 50px;
        height: 50px;
        border: solid white 1px;
        backdrop-filter: brightness(2);
        cursor: move;
        -webkit-user-drag: none;
        z-index: 1;
    }
    .cut-scale-rb {
        position: absolute;
        width: 9px;
        height: 9px;
        border: solid white 1px;
        right: 0;
        bottom: 0;
        transform: translate(100%,100%);
        cursor:nwse-resize;
    }
    .cut-scale-lb {
        position: absolute;
        width: 9px;
        height: 9px;
        border: solid white 1px;
        left: 0;
        bottom: 0;
        transform: translate(-100%,100%);
        cursor:ne-resize;
    }
    .cut-scale-lt {
        position: absolute;
        width: 9px;
        height: 9px;
        border: solid white 1px;
        left: 0;
        top: 0;
        transform: translate(-100%,-100%);
        cursor:se-resize;
    }
    .cut-scale-rt {
        position: absolute;
        width: 9px;
        height: 9px;
        border: solid white 1px;
        right: 0;
        top: 0;
        transform: translate(100%,-100%);
        cursor:sw-resize;
    }
    .upload-img {
        position: relative;
        -webkit-user-drag: none;
        user-select: none;
    }
    .select-img-btn::-webkit-file-upload-button {
        display: none;
    }
    .selected-upload {
        position: relative;
        width: max-content;
        height: max-content;
        display: inline-block;
        align-items: center;
        cursor: pointer;
    }
    .icon {
        position: relative;
        margin-right: 3px;
        transform: translateY(15%);
    }
    .selected-upload > span {
        position: relative;
        font-size: 0.8rem;
    }
    .selected-upload:hover > .icon > path {
        fill: rgb(38, 127, 205);
    }
    .selected-upload:hover > span:nth-child(2) {
        color: rgb(38, 127, 205) !important;
    }
    .selected-img {
        position: absolute;
        opacity: 0;
        width: 100%;
        display: none;
    }
    .selected-img::-webkit-file-upload-button {
        display: none;
    }

    .submit {
        position: relative;
        padding: 3px 30px;
        width: max-content;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 3px;
        cursor: pointer;
        left: 50%;
        transform: translateX(-50%);
    }


    .px {
        position: relative;
        width: max-content;
        height: min-content;
        right: 0;
        transform: translateY(10%);
        font-size: 0.8rem;
    }

    .tips {
        position: fixed;
    }
</style>
