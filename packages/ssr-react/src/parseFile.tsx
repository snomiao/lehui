import * as d3 from "d3";
import { groupBy, mapValues } from "lodash-es";
import React from "react";
import * as xlsx from "xlsx";
import pkg from "../package.json";
// import 'object-flattener'

const 商品类型正则表: Record<string, RegExp | string> = {
  // 类型
  肉类: /瘦肉|肥肉/,
  蔬菜水果: /蔬菜|水果/,

  // 子类型
  蔬菜: /洋葱|.菜/,
  水果: /苹果|香蕉|梨|菠萝|果/,
  其它: /可乐|汽水|奶茶|.水|.汁/,
  盒装肉: /[虾鸡猪鸭鱼].*?[盒袋]/,
  // 百货: /.*/,
};
const 小区地址正则表: Record<string, RegExp | string> = {
  三景苑: /金汇塘东?路?38/,
  上海师范大学: /上海师范大学|上师大/,
  上海应用技术大学: /应技大|上海应用技术大学|上应大|应用技术/,
  世纪家苑: /(海湾旅游区)?金汇塘东?路?158/,
  世茂一期别墅区: /世茂一期|世茂一期别墅区/,
  世茂二期28弄: /世茂二期28弄?/,
  世茂海滨馨苑: /民乐路?28|海滨馨苑/,
  世茂爱马尚郡: /民乐路?28|爱马尚郡/,
  休闲花苑: "休闲花苑",
  佳源: /佳[源缘](梦想)?广场|佳源广场|佳缘梦想广场|金海公路?99弄?|柘林镇99弄?/,
  健康花苑: /海浪路?39/,
  凤鸣海尚_碧桂园: /凤鸣海尚|碧桂园/,
  力泉医院: /海马路?5699/,
  华东理工大学: /华东理工|华东理工大学|华理/,
  嘉业海悦苑: /海马路?2155|嘉业海悦/,
  圆石滩: /(海湾旅游区)?海马路?5111/,
  圣地雅歌: /(海湾旅游区)?(人民塘路?(959|1018|1019))/,
  圣地雅歌海墅: /人民塘路?326/,
  招商海廷: /人民塘路?959/,
  招商海廷七期: /人民塘路?1018/,
  招商海廷二期: /人民塘路?1019/,
  散客: /散客/,
  新一村: /新一村/,
  新三村: /新三村/,
  新二村: /新二村/,
  新港村: "新港村",
  新院村: /奉炮公路?432/,
  旭辉圆石滩: /海马路?5111[弄号]1[弄号]/,
  旭辉圆石滩精品酒店: /海马路?5111/,
  明悦豪庭: /明悦豪庭|暸海路?159弄?8号?|暸海路?159弄?/,
  星火附近小区: /星火附近/,
  桂花园: /桂花园|民乐路?与中心路?|交叉口/,
  棕榈滩东海岸公寓: /金汇塘东?路?388/,
  棕榈滩公寓388弄东海岸公寓: /金汇塘东?路?388|棕榈滩公寓388弄?|东海岸公寓?/,
  棕榈滩别墅: /金汇塘东?路?301|金汇塘东?路?369/,
  棕榈滩别墅301弄: /金汇塘东?路?301/,
  棕榈滩别墅369弄: /金汇塘东?路?369/,
  棕榈滩海景城: /金汇塘东?路?1399弄?|金汇塘东?路?1799弄?|近海草路?|棕榈湾海景城/,
  棕榈滩海景城北1门: /金汇塘东路?1399/,
  棕榈滩高尔夫: /(海湾旅游区)?金汇塘东?路?88弄(近浦星公路?)/,
  棕榈滩高尔夫别墅: /海马路?4199/,
  海上皇宫: "海上皇宫",
  海尚墅林苑: /海泉路?555/,
  海湾世纪佳苑: /金汇塘东?路?158/,
  海湾健康花苑: /海浪路?39弄|健康花苑/,
  海湾新家园: /农机路?89|新家园/,
  海湾新苑: /海湾新苑|明城路?1198弄?/,
  海湾艺墅: /海马路?5699/,
  海湾铭苑: /海湾[茗名铭]苑|海农公?路?1668弄?/,
  滩浒新村: /海佳路?/,
  玫瑰园: /玫瑰园|明城路?1166弄?/,
  珊瑚湾: /(海湾旅游区)?海马路?4333/,
  绿地香溢: /海兴路?1881弄?|(海湾旅游区)?5888弄/,
  绿地香颂: /海马路?5888/,
  老一村: /老一村/,
  老二村: /老二村/,
  聚祥苑: /聚祥苑|暸海路?239弄?/,
  芝兰宾馆: /奉炮公路?378栋/,
  金海湾花苑: /金汇塘东?路??1900/,
  阳光海岸: /海湾路?369/,
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

      const 汇总表列 = 子表列提取(lines, ["汇总", "数值"], ["商品销售统计", "数量"]);
      const 商品销售统计表列 = 子表列提取(lines, ["商品销售统计", "数量"], ["", ""]);
      const 未合并订单表列 = 子表列提取(
        lines,
        [
          "订单编号",
          "付款状态",
          "订购时间",
          "订单类型",
          "微信昵称/备注名",
          "顾客姓名",
          "顾客电话",
          "顾客地址",
          "自提地址",
          "自提时间",
          "商品",
          "商品单价（元）",
          "购买数量",
          "订单金额（元）",
          "顾客备注",
        ],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      );
      const 捕获商品单价表 = {};
      const 捕获商品数量表 = {};
      // "商品单价（元）"
      const 归并订单表列 = 未合并订单表列
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
              显示商品名: 商品.replace("$", ""),
              raw商品: 商品,
              商品单价,
              购买数量,
            },
          ];
          捕获商品单价表[商品] = 商品单价;
          捕获商品数量表[商品] = (捕获商品数量表[商品] || 0) + 购买数量;
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
            订单金额: `${订单金额}元`,
            顾客备注,
          };
          订单表列.push(订单详情);
          return 订单表列;
        }, [])
        .sort((a, b) => a.手机尾号.localeCompare(b.手机尾号))
        .sort((a, b) => a.识别小区.localeCompare(b.识别小区));

      // 导出订单表列.
      console.log(汇总表列);
      console.log(归并订单表列);
      const 宽度 = 4;

      const 订单XLSX列列 = 归并订单表列.flatMap(
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
            .flatMap(({ 类型, 显示商品名, 商品单价, 购买数量 }) => [
              类型,
              显示商品名,
              购买数量,
              `${商品单价}元`,
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

      // SKU 情况统计
      const 增强商品销售统计表列 = 商品销售统计表列.map((e) => {
        const 商品 = e.商品销售统计;
        const 单价 = 捕获商品单价表[商品];
        const 数量 = 捕获商品数量表[商品];
        return { ...e, 单价: 单价, 数量: 数量, 小计: 单价 * 数量 };
      });

      // 肉类、蔬菜水果、百货 大类统计
      const 商品销售统计汇总表列表 = groupBy(增强商品销售统计表列, (e) => {
        const 商品 = e.商品销售统计;
        return 商品大类解析(商品);
      });
      const 商品销售统计汇总表表 = mapValues(商品销售统计汇总表列表, (e) =>
        e.reduce(
          (汇总, 条目) => {
            const 金额 = 汇总.金额 + 条目.小计;
            const 数量 = 汇总.数量 + 条目.数量;
            return { 金额, 数量 };
          },
          { 数量: 0, 金额: 0 },
        ),
      );
      const 商品销售统计汇总列列 = Object.entries(商品销售统计汇总表表).flatMap(
        ([类型, { 数量, 金额 }]) => [
          [`${类型}数量`, 数量],
          [`${类型}金额`, 金额],
          [`${类型}单品均价`, 金额 / 数量],
        ],
      );
      const 增强汇总表列 = 汇总表列.concat(
        商品销售统计汇总列列.map(([k, v]) => ({ 汇总: k, 数值: v })),
      );
      globalThis.解析结果 = {
        订单表列: 归并订单表列,
        汇总: 增强汇总表列,
        商品销售统计: 增强商品销售统计表列,
      };
      globalThis.全部下载 = () => {
        表列XLSX下载("汇总", 增强汇总表列);
        表列XLSX下载("商品销售统计", 商品销售统计表列);
        订单列列XLSX下载("顾客订单列", 导出订单XLSX列列);
      };
      resolve(导出订单XLSX列列);
    };
  });
}

function 地址小区解析(地址: string) {
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
}

function 子表列提取<H extends string>(lines: string[], 表头: H[], 表尾: string[]) {
  // ref: [keyof for arrays · Issue #20965 · microsoft/TypeScript]( https://github.com/Microsoft/TypeScript/issues/20965 )
  const startIndex = lines.findIndex((e) => e.startsWith(表头.join(",")));
  const subLines = lines.slice(startIndex);
  const endIndex = subLines.findIndex((e) => e.startsWith(表尾.join(",")));
  const csvContent = subLines.slice(0, endIndex).join("\n");
  const 表列 = d3.csvParse(csvContent).map(({ [""]: empty, ...e }) => ({ ...e }));
  return 表列 as { [k in H]: any }[];
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
  download(wbout, `${name}.xlsx`);
}

function 订单列列XLSX下载(name: string, aoa: any[][]) {
  const sheet = xlsx.utils.aoa_to_sheet(aoa);
  // large font
  aoa.map((row, r) =>
    row.map((content, c) => {
      if (!content?.match(/订单编号|手机尾号/)) return;
      const cell = sheet[xlsx.utils.encode_cell({ r, c: c + 1 })];
      cell.s = { font: { sz: "36pt", bold: true } };
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
  const wbout = xlsx.write(workbook_out, {
    type: "binary",
    cellStyles: true,
    Props: { Author: "snomiao <snomiao@gmail.com>" },
  });
  download(wbout, `${name}.xlsx`);
}
function 商品大类解析(商品: string) {
  if (商品.startsWith("a")) return "肉类";
  if (商品.startsWith("$")) return "蔬菜水果";
  return "百货";
}
function 商品类型解析(商品: string) {
  return 商品大类解析(商品);
  // return Object.entries(商品类型正则表)
  //   .map(([类型, 模式]) => ({ 类型, 模式 }))
  //   .filter((e) => 商品.match(e.类型) || (e.模式 && 商品.match(e.模式)))
  //   .map((e) => e?.类型)
  //   .join("/");
}
function string2arrayBuffer(s: string) {
  //字符串转字符流
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

function download(content: string, filename: string) {
  if (!globalThis.document) return;
  // 创建隐藏的可下载链接
  const eleLink = document.createElement("a");
  eleLink.download = filename;
  eleLink.style.display = "none";
  // 字符内容转变成blob地址
  var blob = new Blob([string2arrayBuffer(content)]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}
