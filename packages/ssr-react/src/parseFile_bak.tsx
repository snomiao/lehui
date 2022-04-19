import * as d3 from "d3";
import React from "react";
import * as xlsx from "xlsx";
import pkg from "../package.json";

const s2ab = (s) => {
  //字符串转字符流
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
};

const 小区地址正则表: any = {
  绿地香颂: /海马路?5888/,
  海湾艺墅: /海马路?5699/,
  力泉医院: /海马路?5699/,
  旭辉圆石滩: /海马路?5111[弄号]1[弄号]/,
  旭辉圆石滩精品酒店: /海马路?5111/,
  棕榈滩高尔夫别墅: /海马路?4199/,
  海尚墅林苑: /海泉路?555/,
  金海湾花苑: /金汇塘东?路??1900/,
  棕榈滩海景城: /金汇塘东?路?1399弄?|金汇塘东?路?1799弄?|近海草路?|棕榈湾海景城/,
  棕榈滩海景城北1门: /金汇塘东路?1399/,
  棕榈滩东海岸公寓: /金汇塘东?路?388/,
  棕榈滩别墅: /金汇塘东?路?301|金汇塘东?路?369/,
  海湾世纪佳苑: /金汇塘东?路?158/,
  招商海廷: /人民塘路?959/,
  招商海廷七期: /人民塘路?1018/,
  招商海廷二期: /人民塘路?1019/,
  圣地雅歌海墅: /人民塘路?326/,
  新院村: /奉炮公路?432/,
  佳源: /佳[源缘](梦想)?广场|佳源广场|佳缘梦想广场|金海公路?99弄?|柘林镇99弄?/,
  阳光海岸: /海湾路?369/,
  芝兰宾馆: /奉炮公路?378栋/,
  世茂爱马尚郡: /民乐路?28|爱马尚郡/,
  世茂海滨馨苑: /民乐路?28|海滨馨苑/,
  海湾新家园: /农机路?89|新家园/,
  海湾健康花苑: /海浪路?39弄|健康花苑/,
  珊瑚湾: /(海湾旅游区)?海马路?4333/,
  嘉业海悦苑: /海马路?2155|嘉业海悦/,
  海上皇宫: "海上皇宫",
  滩浒新村: /海佳路?/,
  休闲花苑: "休闲花苑",
  棕榈滩高尔夫: /(海湾旅游区)?金汇塘东?路?88弄(近浦星公路?)/,
  世纪家苑: /(海湾旅游区)?金汇塘东?路?158/,
  三景苑: /金汇塘东?路?38/,
  棕榈滩别墅369弄: /金汇塘东?路?369/,
  棕榈滩公寓388弄东海岸公寓: /金汇塘东?路?388|棕榈滩公寓388弄?|东海岸公寓?/,
  棕榈滩别墅301弄: /金汇塘东?路?301/,
  圣地雅歌: /(海湾旅游区)?(人民塘路?(959|1018|1019))/,
  圆石滩: /(海湾旅游区)?海马路?5111/,
  健康花苑: /海浪路?39/,
  新港村: "新港村",
  绿地香溢: /海兴路?1881弄?|(海湾旅游区)?5888弄/,
  上海应用技术大学: /应技大|上海应用技术大学|上应大|应用技术/,
  华东理工大学: /华东理工|华东理工大学|华理/,
  上海师范大学: /上海师范大学|上师大/,
};
const 地址小区解析 = (地址) => {
  if (!地址.trim()) return "";
  const 正则匹配结果 = Object.entries(小区地址正则表)
    .map(([小区, 地址]) => ({
      小区,
      地址,
    }))
    .filter((小区地址) => 地址.match(小区地址.小区) || (小区地址.地址 && 地址.match(小区地址.地址)))
    .map((e) => e?.小区);
  return (
    // 正则表达式匹配到
    (正则匹配结果.length && 正则匹配结果.join("/")) ||
    // 未知
    ""
  );
  // 1. tab/acti/
};
const download = function (content, filename) {
  if (!globalThis.document) return;
  // 创建隐藏的可下载链接
  const eleLink = document.createElement("a");
  eleLink.download = filename;
  eleLink.style.display = "none";
  // 字符内容转变成blob地址
  var blob = new Blob([s2ab(content)]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};

export function ParseFileReRender({ latestFiles }: any) {
  const [parseResults, setParseResults] = React.useState(null);

  React.useEffect(() => {
    Promise.all(latestFiles?.map(async (file) => await parseFile(file)) || []).then(
      setParseResults,
    );
  }, [latestFiles]);

  // if (!globalThis.document) return <>文档框架 加载中</>;
  if (!latestFiles?.length) return <>请导入要解析的文件</>;
  if (!parseResults?.length) return <>请导入要解析的文件.</>;

  console.log("parseResults", parseResults);
  return (
    <>
      <div>解析结果数： {parseResults.length} 个结果</div>
      {globalThis.全部下载 && <button onClick={() => globalThis.全部下载()}>全部下载</button>}
      {/* <JSONViewer json={parseResults[0]} /> */}
    </>
  );
}
export function parseFile(file) {
  return new Promise((resolve) => {
    //ref: https://www.w3.org/TR/file-upload/#dfn-filereader
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      var file_content = e.target.result;
      var workbook = xlsx.read(file_content, { type: "binary" });

      const 工作表列表 = [...Object.values(workbook.Sheets)];

      const sheet = 工作表列表[0];
      const csv = xlsx.utils.sheet_to_csv(sheet);

      // const splitCSV
      const lines = csv.split("\n");
      const 导出时间 = lines
        .find((e) => e.match("导出时间"))
        .replace(/导出时间[：:]/, "")
        .replace(/,/g, "");
      // .match(/导出时间[:：]\s*?(.*?)-(.*?)/);
      console.log(导出时间);
      const 汇总数值rawlines = lines.slice(lines.findIndex((e) => e.startsWith("汇总,数值")));
      const 汇总数值csv = 汇总数值rawlines
        .slice(
          0,
          汇总数值rawlines.findIndex((e) => e.startsWith(",,,,,,")),
        )
        .join("\n");
      const 汇总表列 = d3.csvParse(汇总数值csv).map(({ [""]: empty, ...e }) => ({ ...e }));

      const 订单rawlines = lines.slice(
        lines.findIndex((e) => e.startsWith("订单编号,付款状态,订购时间,订单类型,")),
      );
      const 订单csv = 订单rawlines.slice(0).join("\n");
      const 订单表列 = d3
        .csvParse(订单csv)
        .map(({ [""]: empty, ...e }) => ({ ...e }))
        .reduce((订单表列, 订单行) => {
          const {
            订单编号,
            付款状态,
            订购时间,
            订单类型,
            ["微信昵称/备注名"]: 微信昵称_备注名,
            顾客姓名,
            顾客电话,
            顾客地址,
            自提地址,
            自提时间,
            ["订单金额（元）"]: 订单金额_元,
            顾客备注,
          } = 订单行;
          const { 商品, ["商品单价（元）"]: 商品单价_元, 购买数量 } = 订单行;
          const 商品列 = [{ 商品: 商品.replace("$", ""), 商品单价_元, 购买数量 }];
          if (订单编号) {
            const 订单详情 = {
              识别小区: 地址小区解析(自提地址 + 顾客地址),
              订单编号,
              付款状态,
              订购时间,
              订单类型,
              // 顾客信息: {
              微信昵称_备注名,
              顾客姓名,
              顾客电话,
              自提地址: 自提地址.replace(/上海市上海市/, "上海市"),
              顾客地址: 顾客地址.replace(/上海市上海市/, "上海市"),
              // },
              自提时间,
              商品列,
              订单金额_元,
              顾客备注,
            };
            订单表列.push(订单详情);
            return 订单表列;
          } else {
            const 最近订单 = 订单表列[订单表列.length - 1];
            最近订单.商品列.push(...商品列);
            return 订单表列;
          }
        }, [])
        .sort((a, b) => a.顾客地址.localeCompare(b.顾客地址))
        .sort((a, b) => a.识别小区.localeCompare(b.识别小区));

      // 导出订单表列.
      console.log(汇总表列);
      console.log(订单表列);
      const 宽度 = 6;

      const 订单XLSX列列 = 订单表列.flatMap(
        ({
          识别小区,
          订单编号,
          付款状态,
          订购时间,
          订单类型,
          顾客信息,
          微信昵称_备注名,
          顾客姓名,
          顾客电话,
          自提地址,
          顾客地址,
          自提时间,
          订单金额_元,
          顾客备注,
          商品列,
        }) => {
          const 订单信息行1 = [
            "地址",
            自提地址 || 顾客地址,
            "识别小区",
            识别小区,
            "自提时间",
            自提时间,
            "订单编号",
            订单编号,
            "付款状态",
            付款状态,
          ];
          const 订单信息行2 = [
            "顾客地址",
            顾客地址,
            "顾客信息",
            顾客信息,
            "微信昵称_备注名",
            微信昵称_备注名,
            "顾客姓名",
            顾客姓名,
            "顾客电话",
            顾客电话,
          ];
          const 订单信息行3 = [
            "顾客备注",
            顾客备注,
            "订购时间",
            订购时间,
            "订单类型",
            订单类型,
            "订单金额_元",
            订单金额_元,
          ];
          const 商品信息行 = 商品列.flatMap(({ 商品, 商品单价_元, 购买数量 }) => [
            "商品",
            商品,
            // "",
            // "",

            "数量",
            购买数量,
            "单价",
            商品单价_元 + "元",

            // "单价 * 数量",
            // 商品单价_元 + "元 x " + 购买数量,
          ]);
          
          const 返回多信息行 = [
            // 空
            ...[""].reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            // 空
            ...[""].reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill("---");
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            // 空
            ...[""].reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            //
            ...订单信息行1.reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            ...订单信息行2.reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            ...订单信息行3.reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
            // ...[""].reduce((多信息行, 信息, i) => {
            //   const x = i % 宽度;
            //   const y = (i / 宽度) | 0;
            //   多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
            //   多信息行[y][x] = 信息;
            //   return 多信息行;
            // }, []),
            ...商品信息行.reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 信息;
              return 多信息行;
            }, []),
          ];
          return 返回多信息行;
        },
      );
      const 导出订单XLSX列列 = [
        ...["顾客订单表", `乐汇超市订单汇总系统 v${pkg.version}`].reduce((多信息行, 信息, i) => {
          const x = i % 宽度;
          const y = (i / 宽度) | 0;
          多信息行[y] = 多信息行[y] || Array(宽度).fill(null);
          多信息行[y][x] = 信息;
          return 多信息行;
        }, []),
        ...["导出时间", 导出时间].reduce((多信息行, 信息, i) => {
          const x = i % 宽度;
          const y = (i / 宽度) | 0;
          多信息行[y] = 多信息行[y] || Array(宽度).fill(null);
          多信息行[y][x] = 信息;
          return 多信息行;
        }, []),
        ...订单XLSX列列,
      ];
      resolve(导出订单XLSX列列);
      // console.log(订单XLSX表列);

      // var json = xlsx.utils.sheet_to_json(工作表列表[工作表列表.length - 1]);
      // console.log(json)
      globalThis.解析结果 = { 订单表列, 汇总表列 };
      globalThis.全部下载 = () => {
        表列XLSX下载("汇总表", 汇总表列);
        订单列列XLSX下载("顾客订单列", 导出订单XLSX列列);
        // 表列XLSX下载(
        //   "订单表",
        //   订单表列.map(({ 商品列, ...e }) => {
        //     yaml;
        //     return { ...e, 商品列: yaml.stringify(商品列) };
        //   })
        // );
      };
      // resolve(订单表列);
    };
  });
}
function 表列XLSX下载(name: string, jsonArray: any) {
  const Sheets = {
    [name]: xlsx.utils.json_to_sheet(jsonArray),
  };
  const workbook_out = {
    SheetNames: [...Object.keys(Sheets)],
    Sheets,
  };
  const wbout = xlsx.write(workbook_out, { type: "binary" });
  download(wbout, name + ".xlsx");
}

function 订单列列XLSX下载(name: string, aoa: any) {
  const s = xlsx.utils.aoa_to_sheet(aoa);
  s["!cols"] = fitToColumn(aoa);
  s["!merges"] = mergePhone(aoa);

  // s["!merges"]

  function fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((cell, i) => ({
      wch: Math.max(...arrayOfArray.map((row) => (row[i] ? row[i].toString().length * 2 : 0))),
    }));
  }

  function mergePhone(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray?.map((cell, i) => ({
      wch: Math.max(...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length * 2 : 0))),
    }));
  }
  // {s: {font: {name: "SimHei", sz: "24", bold: true, vertAlign: true}}}
  // s["!merges"]
  const Sheets = {
    [name]: s,
  };
  const workbook_out = {
    SheetNames: [...Object.keys(Sheets)],
    Sheets,
  };
  const wbout = xlsx.write(workbook_out, { type: "binary" });
  download(wbout, name + ".xlsx");
}
