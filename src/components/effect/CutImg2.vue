<script setup lang="ts">
import { selected, useCutImg, allowMove, allowScale } from '@/util/cutImg';
import { ref } from 'vue';

const props = defineProps<{
                preW : number,
                whRatio : number,
                isAvatar : boolean,
                cutBoxW : number,
            }>()

const tarImg = ref<HTMLImageElement>();
const preImg = ref<HTMLImageElement>();
const cutFrame = ref<HTMLDivElement>();



const {isSelected, data} = useCutImg()
                    .setVnode(tarImg, preImg, cutFrame)
                    .setProps(props.cutBoxW, props.whRatio, props.preW)
                    .getSelectStatus();
const themeStore = useThemeStore();



</script>


<template>
    <div class="container-cut">
        <!-- 未选择图片 -->
        <div class="no-select" v-show="!isSelected">
            <input class="select-img-btn" type="file" accept="image/png,image/jpg,image/jpeg" @change="selected($event)">
            <svg class="upload-icon" viewBox="0 0 1029 1024" xmlns="http://www.w3.org/2000/svg" width="36" height="36" style="fill : rgb(140,140,140)">
                <path d="M661.23 1003.042H119.672c-64.034 0-116.053-51.883-116.053-115.712V115.917C3.618 52.224 55.638 0.068 119.671 0.068H893.27c63.898 0 115.985 52.02 115.985 115.849v539.99c0 21.23-17.34 38.775-38.707 38.775s-38.912-17.34-38.912-38.776v-539.99c0-21.23-17.34-38.638-38.57-38.638H119.67c-21.299 0-38.912 17.408-38.912 38.639v771.14c0 21.231 17.613 38.639 38.912 38.639h541.492c21.162 0 38.707 17.203 38.707 38.639 0.068 21.3-17.545 38.707-38.64 38.707z"></path>
                <path d="M42.325 771.755c-9.762 0-19.729-4.028-27.238-11.606-14.95-14.95-14.95-39.458 0-54.408l192.785-192.034c35.157-35.158 89.156-44.169 133.803-21.777L551.39 596.65c14.814 7.578 32.768 4.643 44.373-7.167l347.614-346.317c14.95-15.019 39.458-15.019 54.682 0 15.223 14.882 15.087 39.39 0 54.545l-347.75 346.317c-35.09 35.089-88.816 43.759-133.667 21.367L306.86 561.084c-14.95-7.578-32.7-4.506-44.374 7.168L69.7 760.012c-7.51 7.578-17.34 11.743-27.375 11.743zM351.71 385.775c-63.898 0-116.053-51.746-116.053-115.712 0-63.898 51.882-115.712 116.053-115.712 63.76 0 116.053 51.883 116.053 115.712 0 63.898-52.36 115.712-116.053 115.712z m0-154.146c-21.163 0-38.776 17.271-38.776 38.502 0 21.368 17.477 38.64 38.776 38.64 21.163 0 38.639-17.272 38.639-38.64 0-21.23-17.34-38.502-38.64-38.502zM834.833 1024c-21.367 0-38.844-17.203-38.844-38.775V753.869c0-21.095 17.204-38.64 38.844-38.64 21.163 0 38.776 17.34 38.776 38.64v231.356c-0.069 21.572-17.545 38.775-38.776 38.775z"></path>
                <path d="M989.389 868.284c-9.49 0-18.978-3.345-26.76-10.377l-127.864-120.15-128.478 120.15c-15.36 14.404-39.8 13.858-54.409-1.57-14.677-15.633-13.994-39.868 1.707-54.682L788.89 674.611c11.127-13.721 27.58-21.436 45.533-21.436 17.818 0 34.27 7.988 45.261 21.436l135.441 127.044c15.702 14.814 16.52 38.912 1.775 54.682-6.758 7.782-17.066 11.947-27.511 11.947z"></path>
            </svg>
            <div class="no-select-mask" style="background : rgb(200,200,200)"></div>
            <span style="color : rgb(50,50,50)">选择本地图片</span>
        </div>
        <!-- 已选择图片 -->
        <div class="cut-box" v-show="isSelected" :style="{width : cutBoxW + 'px', height : (cutBoxW) / whRatio + 'px'}">
            <!-- 上传的图片 -->
            <div :style="{maxWidth : cutBoxW + 'px', maxHeight : cutBoxW / whRatio + 'px'}">
                <img class="upload-img" ref="tarImg">
                <div class="cut-mask" ref="cutFrame"></div>
                <div ref="cutFrame" class="cut" @mousedown="allowMove($event)" :style="{width : data.cut.w + 'px',
                                                                                        height : data.cut.h + 'px',
                                                                                        left : data.cut.left + 'px',
                                                                                        top : data.cut.top + 'px'}">
                    <span ref="rb" class="cut-scale-rb" @mousedown="allowScale($event)"></span>
                    <span ref="lb" class="cut-scale-lb" @mousedown="allowScale($event)"></span>
                    <span ref="rt" class="cut-scale-rt" @mousedown="allowScale($event)"></span>
                    <span ref="lt" class="cut-scale-lt" @mousedown="allowScale($event)"></span>
                </div>
            </div>
        </div>

        <!-- 预览 -->
        <div class="preview">
            <!-- 头像 -->
            <div class="p-avatar">
                <div class="a-img-mask a-img-mask-light" :style="isAvatar ? {borderRadius : '50%', width : preW + 'px', height : preW + 'px'} : {borderRadius : '8px', width : preW + 'px', height : preW / whRatio + 'px'}">
                    <img ref="preImg" src="@/assets/222.jpg" alt=" "/>
                </div>
                <span v-if="!isAvatar" style="color : rgb(50,50,50)">预览图片</span>
                <span v-if="isAvatar" style="color : rgb(50,50,50)">{{ isSelected == false ? '当前头像' : '预览头像' }}</span>
            </div>
            <!-- 其他 -->
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
        overflow: hidden;
        justify-content: center;
        align-items: center;
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
    .select-img-btn:hover ~ .no-select-mask {
        background: rgba(105, 105, 105, 0.5) !important;
    }

    .upload-icon {
        position: absolute;
        top: 15%;

    }

    .preview {
        position: relative;
        width: max-content;
        height: 160px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;   
        padding-left: 50px;
        border-left: solid rgba(132, 132, 132, 0.7) 1px;
    }

    .p-avatar {
        position: relative;
        width: 100%;
        height: 100%;
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
    .a-img-mask + span {
        position: absolute;
        width: max-content;
        left: 50%;
        bottom: 20%;
        transform: translateX(-50%);
        font-size: 0.8rem;
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
        filter: brightness(2);
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
        filter: brightness(2);
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
        filter: brightness(2);
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
        filter: brightness(2);
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
</style>
