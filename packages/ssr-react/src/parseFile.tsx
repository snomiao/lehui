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
const 商品类型正则表: Record<string, RegExp | string> = {
  肉: /瘦肉|肥肉/,
  盒装肉: /[虾鸡猪鸭鱼].*?[盒袋]/,
  蔬菜: /洋葱|菜/,
  水果: /苹果|香蕉|梨|菠萝|果/,
  饮料: /可乐|汽水|奶茶|水|汁/,
  // 百货: /.*/,
};
const 小区地址正则表: Record<string, RegExp | string> = {
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
  绿地香颂: /海马路?5888/,
  绿地香溢: /海兴路?1881弄?|(海湾旅游区)?5888弄/,
  上海应用技术大学: /应技大|上海应用技术大学|上应大|应用技术/,
  华东理工大学: /华东理工|华东理工大学|华理/,
  上海师范大学: /上海师范大学|上师大/,
  星火附近小区: /星火附近/,
  老一村新一村: /老一村|新一村/,
  老二村: /老二村/,
  世茂二期: /世茂二期28弄?/,
  世茂一期别墅区: /世茂一期|世茂一期别墅区/,
  聚祥苑: /聚祥苑|暸海路?239弄?/,
  明悦豪庭: /明悦豪庭|暸海路?159弄?8号?|暸海路?159弄?/,
  玫瑰园: /玫瑰园|明城路?1166弄?/,
  桂花园: /桂花园|民乐路?与中心路?|交叉口/,
  凤鸣海尚: /凤鸣海尚|碧桂园/,
  碧桂园: /凤鸣海尚|碧桂园/,
  海湾新苑: /海湾新苑|明城路?1198弄?/,
  海湾铭苑: /海湾名苑|海湾铭苑|海农公?路?1668弄?/,
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
  console.table(parseResults[0].slice(0, 20));
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
            ["微信昵称/备注名"]: 微信昵称,
            顾客姓名,
            顾客电话,
            顾客地址,
            自提地址,
            自提时间,
            ["订单金额（元）"]: 订单金额,
            顾客备注,
          } = 订单行;
          const { 商品, ["商品单价（元）"]: 商品单价, 购买数量 } = 订单行;
          const 商品列 = [
            {
              类型: 商品类型解析(商品),
              商品: 商品.replace("$", ""),
              raw商品: 商品,
              商品单价,
              购买数量,
            },
          ];
          if (!订单编号) {
            const 最近订单 = 订单表列[订单表列.length - 1];
            最近订单.商品列.push(...商品列);
            return 订单表列;
          }
          const 订单详情 = {
            识别小区: 地址小区解析(自提地址 + 顾客地址),
            订单编号,
            付款状态,
            订购时间,
            订单类型,
            // 顾客信息: {
            微信昵称,
            顾客姓名,
            顾客电话,
            自提地址: 自提地址.replace(/上海市上海市/, "上海市"),
            顾客地址: 顾客地址.replace(/上海市上海市/, "上海市"),
            手机尾号: 顾客电话.slice(-4),
            // },
            自提时间,
            商品列,
            订单金额: 订单金额 + "元",
            顾客备注,
          };
          订单表列.push(订单详情);
          return 订单表列;
        }, [])
        .sort((a, b) => a.手机尾号.localeCompare(b.手机尾号))
        .sort((a, b) => a.识别小区.localeCompare(b.识别小区));

      // 导出订单表列.
      console.log(汇总表列);
      console.log(订单表列);
      const 宽度 = 4;

      const 订单XLSX列列 = 订单表列.flatMap(
        ({
          识别小区,
          订单编号,
          付款状态,
          订购时间,
          订单类型,
          // 顾客信息,
          微信昵称,
          顾客姓名,
          顾客电话,
          自提地址,
          顾客地址,
          自提时间,
          订单金额,
          手机尾号,
          顾客备注,
          商品列,
        }) => {
          // 自提地址 || 顾客地址
          const 订单信息行列 = [
            ["订单编号", 订单编号, "手机尾号", 手机尾号],
            ["顾客地址", 顾客地址, "识别小区", 识别小区],
            ["自提地址", 自提地址, "自提时间", 自提时间],
            ["顾客姓名", 顾客姓名, "订购时间", 订购时间],
            ["微信昵称", 微信昵称, "顾客电话", 顾客电话],
            ["订单类型", 订单类型, "付款状态", 付款状态],
            ["顾客备注", 顾客备注, "订单金额", 订单金额],
          ];
          const 商品头 = [["类型识别", "商品名称", "购买数量", "单价"]];
          const 商品信息行 = 商品列
            .sort((a, b) => a.raw商品.localeCompare(b.raw商品))
            .sort((a, b) => a.类型.localeCompare(b.类型))
            .flatMap(({ 类型, 商品, 商品单价, 购买数量 }) => [
              类型,
              商品,
              购买数量,
              商品单价 + "元",
            ]);

          const [date, time] = new Date(+new Date() + 8 * 3600e3)
            .toISOString()
            .replace("Z", "")
            .split("T");
          const 返回多信息行 = [
            // 空
            ...[undefined].reduce((多信息行, 信息, i) => {
              const x = i % 宽度;
              const y = (i / 宽度) | 0;
              多信息行[y] = 多信息行[y] || Array(宽度).fill(undefined);
              多信息行[y][x] = 多信息行[y][x] || 信息;
              return 多信息行;
            }, []),
            // 横线
            ...[["@@@@@@@@", `乐汇超市订单汇总系统 v${pkg.version}`, "@@@@@@@@", "@@@@@@@@"]],
            // 空
            ...[time.slice(0, 8), "", "尾号小的", "放左边，大的放右边"].reduce(
              (多信息行, 信息, i) => {
                const x = i % 宽度;
                const y = (i / 宽度) | 0;
                多信息行[y] = 多信息行[y] || Array(宽度).fill(null);
                多信息行[y][x] = 信息;
                return 多信息行;
              },
              [],
            ),
            ...订单信息行列,
            ...商品头,
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

      globalThis.解析结果 = { 订单表列, 汇总表列 };
      globalThis.全部下载 = () => {
        表列XLSX下载("汇总表", 汇总表列);
        订单列列XLSX下载("顾客订单列", 导出订单XLSX列列);
      };
      resolve(导出订单XLSX列列);
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

function 订单列列XLSX下载(name: string, aoa: any[][]) {
  const sheet = xlsx.utils.aoa_to_sheet(aoa);
  // large font
  aoa.map((row, r) =>
    row.map((content, c) => {
      if (!content?.match(/订单编号|手机尾号/)) return;
      const cell = sheet[xlsx.utils.encode_cell({ r, c: c + 1 })];
      cell.s = { font: { sz: 36 } };
      console.log(cell, sheet[xlsx.utils.encode_cell({ r, c: c + 1 })]);
      // // 单元格对齐方式
      // alignment: {
      //   /// 自动换行
      //   wrapText: 1,
      //   // 水平居中
      //   horizontal: "center",
      //   // 垂直居中
      //   vertical: "center"
      // }
      // Object.assign(cell, {
      //   s: { font: { sz: "36", bold: true } },
      // });
    }),
  );
  // fit column width
  sheet["!cols"] = fitToColumn(aoa);
  function fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((cell, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((row) =>
          row[i]
            ? row[i]
                .toString()
                .split("")
                .map((e) => (e.charCodeAt(0) < 128 ? 1 : 2))
                .reduce((a, b) => a + b)
            : 0,
        ),
      ),
    }));
  }

  console.log("large font done");

  const Sheets = {
    [name]: sheet,
  };
  const workbook_out = {
    SheetNames: [...Object.keys(Sheets)],
    Sheets,
  };
  const wbout = xlsx.write(workbook_out, { type: "binary" });
  download(wbout, name + ".xlsx");
}
function 商品类型解析(商品: string) {
  return Object.entries(商品类型正则表)
    .map(([类型, 模式]) => ({ 类型, 模式 }))
    .filter((e) => 商品.match(e.类型) || (e.模式 && 商品.match(e.模式)))
    .map((e) => e?.类型)
    .join("/");
}
