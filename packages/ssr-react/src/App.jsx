import React, { useLayoutEffect, useState } from "react";
import pkg from "../package.json";
// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
import "./App.css";
import { parseFile, ParseFileReRender } from "./parseFile";
// const pages = import.meta.globEager('./pages/*.jsx')
// const initDatas = import.meta.globEager("../../../data/*.xlsx");

// const routes = Object.keys(pages).map((path) => {
//   const name = path.match(/\.\/pages\/(.*)\.jsx$/)[1]
//   return {
//     name,
//     path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
//     component: pages[path].default
//   }
// })

// console.log(initDatas);
const isSSR = () => !globalThis?.window;
let latestFiles = null;
export function App() {
  const [rand, onLatestFilesUpdate] = useState(0);
  if (!isSSR()) {
    useLayoutEffect(() => appInitEffect(onLatestFilesUpdate));
  }
  return (
    <div>
      {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <section>
              拖拽 订单记录 XXXX .xlsx 到这里进行分析。
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone> */}

      <div>
        <h1>乐汇超市订单汇总系统 v{pkg.version}</h1>
      </div>

      <input hidden type="file" id="file" name="files[]" multiple accept=".xls,.xlsx,.csv" />
      <div id="filebox">
        {/* <img
          width="400"
          src="../media/demo.png"
        /> */}
        <div> 拖拽 订单记录 表格 .xlsx 到这里进行分析 </div>
        <div> 或者点击这个方框来选择文件 </div>
      </div>
      <div> - </div>
      <button onClick={() => onLatestFilesUpdate(Math.random())}>解析文件</button>
      <ParseFileReRender latestFiles={latestFiles} random={rand} />
      <div>
        版本说明：<br />
        0.5.4 增加导出时间、<br />
        0.5.3 数量位置微调<br />
      </div>
      {/* <!-- 作者： snomiao <snomiao@gmail.com> --> */}
    </div>
  );
}
function reparse() {
  const file = document.getElementById("file");
  [...file.files].map(parseFile);
}
function appInitEffect(onLatestFilesUpdate) {
  const status = {};
  setTimeout(() => {
    // UI响应部分
    const file = document.getElementById("file");
    const box = document.querySelector("#filebox");

    const onFileChange = (e) => {
      [...e.target.files].map(parseFile);
      latestFiles = [...e.target.files];
      onLatestFilesUpdate(Math.random());
    };
    const onBoxDrop = (e) => {
      [...e.dataTransfer.files].map(parseFile);
    };
    const onBoxClick = (e) => {
      file.click();
    };
    const onboxDragEnter = (e) => {
      box;
    };

    const ondragleave = (e) => e.preventDefault();
    const ondrop = (e) => e.preventDefault();
    const ondragenter = (e) => e.preventDefault();
    const ondragover = (e) => e.preventDefault();

    //拖离 拖后放 拖进 拖来拖去
    document.addEventListener("dragleave", ondragleave);
    document.addEventListener("drop", ondrop);
    document.addEventListener("dragenter", ondragenter);
    document.addEventListener("dragover", ondragover);

    file.addEventListener("change", onFileChange, false);
    box.addEventListener("drop", onBoxDrop, false);
    box.addEventListener("click", onBoxClick);
    box.addEventListener("dragenter", onboxDragEnter);
    status.unload = () => {
      file.removeEventListener("change", onFileChange, false);
      box.removeEventListener("drop", onBoxDrop, false);
      box.removeEventListener("click", onBoxClick);
      box.removeEventListener("dragenter", onboxDragEnter);
      document.removeEventListener("dragleave", ondragleave);
      document.removeEventListener("drop", ondrop);
      document.removeEventListener("dragenter", ondragenter);
      document.removeEventListener("dragover", ondragover);
    };
  }, 200);
  // TODO use await
  return () => status.unload?.();
}
