(()=>{var e={};e.id=190,e.ids=[190],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},5528:e=>{"use strict";e.exports=require("next/dist\\client\\components\\action-async-storage.external.js")},1877:e=>{"use strict";e.exports=require("next/dist\\client\\components\\request-async-storage.external.js")},5319:e=>{"use strict";e.exports=require("next/dist\\client\\components\\static-generation-async-storage.external.js")},9491:e=>{"use strict";e.exports=require("assert")},6113:e=>{"use strict";e.exports=require("crypto")},2361:e=>{"use strict";e.exports=require("events")},358:e=>{"use strict";e.exports=require("fs")},3685:e=>{"use strict";e.exports=require("http")},5158:e=>{"use strict";e.exports=require("http2")},5687:e=>{"use strict";e.exports=require("https")},1808:e=>{"use strict";e.exports=require("net")},1017:e=>{"use strict";e.exports=require("path")},2781:e=>{"use strict";e.exports=require("stream")},6224:e=>{"use strict";e.exports=require("tty")},7310:e=>{"use strict";e.exports=require("url")},3837:e=>{"use strict";e.exports=require("util")},9796:e=>{"use strict";e.exports=require("zlib")},2586:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>i.a,__next_app__:()=>h,originalPathname:()=>p,pages:()=>c,routeModule:()=>x,tree:()=>l});var r=s(7),a=s(8533),n=s(9377),i=s.n(n),d=s(9799),o={};for(let e in d)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>d[e]);s.d(t,o);let l=["",{children:["dashboard",{children:["orders",{children:["[id]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,4670)),"D:\\APP\\Test app QLBH w GG\\frontend\\src\\app\\dashboard\\orders\\[id]\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,3723)),"D:\\APP\\Test app QLBH w GG\\frontend\\src\\app\\dashboard\\layout.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,364)),"D:\\APP\\Test app QLBH w GG\\frontend\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,3472,23)),"next/dist/client/components/not-found-error"]}],c=["D:\\APP\\Test app QLBH w GG\\frontend\\src\\app\\dashboard\\orders\\[id]\\page.tsx"],p="/dashboard/orders/[id]/page",h={require:s,loadChunk:()=>Promise.resolve()},x=new r.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/dashboard/orders/[id]/page",pathname:"/dashboard/orders/[id]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},673:(e,t,s)=>{Promise.resolve().then(s.bind(s,7251))},7251:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>h});var r=s(4714),a=s(7580),n=s(8934),i=s(3278);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let d=(0,s(9858).Z)("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);var o=s(2491),l=s(1102),c=s(4583),p=s(5082);function h(){let{id:e}=(0,n.useParams)(),t=(0,n.useRouter)(),{shop:s}=(0,c.tN)(),[h,x]=(0,a.useState)(null),[m,g]=(0,a.useState)(!0);return((0,a.useEffect)(()=>{let s=async()=>{try{let{data:t}=await l.g3.getById(e);x(t)}catch(e){p.default.error("Kh\xf4ng thể tải đơn h\xe0ng"),t.push("/dashboard/orders")}finally{g(!1)}};e&&s()},[e,t]),m)?r.jsx("div",{className:"flex items-center justify-center h-64",children:r.jsx("div",{className:"animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"})}):h?(0,r.jsxs)("div",{className:"space-y-6 animate-fade-in",children:[(0,r.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[(0,r.jsxs)("div",{className:"flex items-center gap-4",children:[r.jsx("button",{className:"btn btn-ghost p-2",onClick:()=>t.back(),children:r.jsx(i.Z,{className:"w-5 h-5"})}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("h1",{className:"text-2xl font-bold",children:["Đơn h\xe0ng ",h.orderCode]}),r.jsx("span",{className:`badge badge-${c.AQ[h.status]}`,children:c.cL[h.status]})]})]}),(0,r.jsxs)("div",{className:"flex gap-2",children:[(0,r.jsxs)("button",{className:"btn btn-secondary",onClick:()=>{let e=window.open("","_blank");if(!e)return;let t=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>H\xf3a đơn ${h.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 14px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header .shop-name { font-size: 18px; font-weight: bold; color: #333; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { flex: 1; }
          .info-box h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
          .info-box p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 600; }
          .text-right { text-align: right; }
          .total { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${s?.name||"QALY BAHA"}</div>
          <h1>H\xd3A ĐƠN B\xc1N H\xc0NG</h1>
          <p>M\xe3 đơn: <strong>${h.orderCode}</strong></p>
          <p>Ng\xe0y: ${(0,c.p6)(h.createdAt,!0)}</p>
        </div>
        
        <div class="info">
          <div class="info-box">
            <h3>Th\xf4ng tin kh\xe1ch h\xe0ng</h3>
            <p><strong>${h.customerName||"Kh\xe1ch v\xe3ng lai"}</strong></p>
            <p>ĐT: ${h.customerPhone||"-"}</p>
            <p>Địa chỉ: ${h.shippingAddress||"-"}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <h3>Trạng th\xe1i</h3>
            <p><strong>${c.cL[h.status]}</strong></p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">STT</th>
              <th>Sản phẩm</th>
              <th class="text-right" style="width: 100px;">Đơn gi\xe1</th>
              <th class="text-right" style="width: 60px;">SL</th>
              <th class="text-right" style="width: 120px;">Th\xe0nh tiền</th>
            </tr>
          </thead>
          <tbody>
            ${h.items.map((e,t)=>`
              <tr>
                <td>${t+1}</td>
                <td>${e.productName}</td>
                <td class="text-right">${(0,c.xG)(e.price)}</td>
                <td class="text-right">${e.quantity}</td>
                <td class="text-right">${(0,c.xG)(e.price*e.quantity)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right"><strong>Tổng cộng:</strong></td>
              <td class="text-right total">${(0,c.xG)(h.total)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${h.note?`<p><strong>Ghi ch\xfa:</strong> ${h.note}</p>`:""}
        
        <div class="footer">
          <p>Cảm ơn qu\xfd kh\xe1ch đ\xe3 mua h\xe0ng!</p>
          <p>Powered by QALY BAHA</p>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `;e.document.write(t),e.document.close()},children:[r.jsx(d,{className:"w-4 h-4"})," In h\xf3a đơn"]}),(0,r.jsxs)("button",{className:"btn btn-secondary",onClick:()=>{let e=window.open("","_blank");if(!e)return;let t=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu giao h\xe0ng ${h.orderCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; font-size: 14px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; border: 2px solid #333; padding: 10px; display: inline-block; }
          .important { background: #f8f8f8; padding: 15px; border: 1px dashed #ccc; margin-bottom: 20px; }
          .important h2 { font-size: 16px; margin-bottom: 10px; }
          .recipient { font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .text-right { text-align: right; }
          .cod { font-size: 20px; font-weight: bold; color: #d00; text-align: center; margin-top: 20px; padding: 20px; border: 2px solid #d00; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .signatures div { width: 30%; }
          .signatures p:first-child { font-weight: bold; margin-bottom: 60px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PHIẾU GIAO H\xc0NG</h1>
          <p style="margin-top: 10px;">M\xe3 đơn: <strong>${h.orderCode}</strong> | Ng\xe0y: ${(0,c.p6)(h.createdAt)}</p>
        </div>
        
        <div class="important">
          <h2>NGƯỜI NHẬN</h2>
          <p class="recipient">${h.customerName||"Kh\xe1ch v\xe3ng lai"}</p>
          <p>ĐT: <strong>${h.customerPhone||"-"}</strong></p>
          <p>Địa chỉ: <strong>${h.shippingAddress}</strong></p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th class="text-right">SL</th>
            </tr>
          </thead>
          <tbody>
            ${h.items.map((e,t)=>`
              <tr>
                <td>${t+1}</td>
                <td>${e.productName}</td>
                <td class="text-right">${e.quantity}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div class="cod">
          THU HỘ (COD): ${(0,c.xG)(h.total)}
        </div>
        
        <div class="signatures">
          <div>
            <p>Người gửi</p>
            <p>${s?.name||""}</p>
          </div>
          <div>
            <p>Người vận chuyển</p>
            <p>________________</p>
          </div>
          <div>
            <p>Người nhận</p>
            <p>________________</p>
          </div>
        </div>
        
        <script>window.print();</script>
      </body>
      </html>
    `;e.document.write(t),e.document.close()},children:[r.jsx(o.Z,{className:"w-4 h-4"})," In phiếu giao"]})]})]}),(0,r.jsxs)("div",{className:"grid md:grid-cols-2 gap-6",children:[(0,r.jsxs)("div",{className:"card p-4",children:[r.jsx("h3",{className:"font-semibold mb-3",children:"Th\xf4ng tin kh\xe1ch h\xe0ng"}),(0,r.jsxs)("div",{className:"space-y-2 text-sm",children:[(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"T\xean:"})," ",r.jsx("span",{className:"font-medium",children:h.customerName||"Kh\xe1ch v\xe3ng lai"})]}),(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"Điện thoại:"})," ",h.customerPhone||"-"]}),(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"Địa chỉ giao:"})," ",h.shippingAddress]})]})]}),(0,r.jsxs)("div",{className:"card p-4",children:[r.jsx("h3",{className:"font-semibold mb-3",children:"Th\xf4ng tin đơn h\xe0ng"}),(0,r.jsxs)("div",{className:"space-y-2 text-sm",children:[(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"M\xe3 đơn:"})," ",r.jsx("span",{className:"font-mono",children:h.orderCode})]}),(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"Ng\xe0y tạo:"})," ",(0,c.p6)(h.createdAt,!0)]}),h.note&&(0,r.jsxs)("p",{children:[r.jsx("span",{className:"text-dark-400",children:"Ghi ch\xfa:"})," ",h.note]})]})]})]}),(0,r.jsxs)("div",{className:"card",children:[r.jsx("div",{className:"p-4 border-b border-dark-800",children:r.jsx("h3",{className:"font-semibold",children:"Chi tiết sản phẩm"})}),r.jsx("div",{className:"table-container border-0 rounded-none",children:(0,r.jsxs)("table",{className:"table",children:[r.jsx("thead",{children:(0,r.jsxs)("tr",{children:[r.jsx("th",{children:"Sản phẩm"}),r.jsx("th",{className:"text-right",children:"Đơn gi\xe1"}),r.jsx("th",{className:"text-center",children:"SL"}),r.jsx("th",{className:"text-right",children:"Th\xe0nh tiền"})]})}),r.jsx("tbody",{children:h.items.map((e,t)=>(0,r.jsxs)("tr",{children:[r.jsx("td",{className:"font-medium",children:e.productName}),r.jsx("td",{className:"text-right",children:(0,c.xG)(e.price)}),r.jsx("td",{className:"text-center",children:e.quantity}),r.jsx("td",{className:"text-right font-medium",children:(0,c.xG)(e.price*e.quantity)})]},t))}),r.jsx("tfoot",{children:(0,r.jsxs)("tr",{className:"bg-dark-800",children:[r.jsx("td",{colSpan:3,className:"text-right font-semibold",children:"Tổng cộng:"}),r.jsx("td",{className:"text-right font-bold text-lg text-green-400",children:(0,c.xG)(h.total)})]})})]})})]}),!["completed","cancelled"].includes(h.status)&&(0,r.jsxs)("div",{className:"card p-4",children:[r.jsx("h3",{className:"font-semibold mb-4",children:"Cập nhật trạng th\xe1i"}),(0,r.jsxs)("div",{className:"flex flex-wrap gap-3",children:["pending"===h.status&&r.jsx("button",{className:"btn btn-primary",onClick:async()=>{try{await l.g3.updateStatus(h._id,"processing"),p.default.success("Đ\xe3 x\xe1c nhận đơn h\xe0ng");let{data:t}=await l.g3.getById(e);x(t)}catch(e){p.default.error(e.message)}},children:"✓ X\xe1c nhận đơn h\xe0ng"}),"processing"===h.status&&r.jsx("button",{className:"btn btn-primary",onClick:async()=>{try{await l.g3.updateStatus(h._id,"shipping"),p.default.success("Đ\xe3 chuyển sang đang giao");let{data:t}=await l.g3.getById(e);x(t)}catch(e){p.default.error(e.message)}},children:"\uD83D\uDE9A Bắt đầu giao h\xe0ng"}),"shipping"===h.status&&r.jsx("button",{className:"btn btn-primary",onClick:async()=>{try{await l.g3.updateStatus(h._id,"completed"),p.default.success("Đơn h\xe0ng ho\xe0n th\xe0nh!");let{data:t}=await l.g3.getById(e);x(t)}catch(e){p.default.error(e.message)}},children:"✅ Ho\xe0n th\xe0nh đơn h\xe0ng"}),r.jsx("button",{className:"btn btn-danger",onClick:async()=>{if(confirm("Bạn c\xf3 chắc muốn hủy đơn h\xe0ng n\xe0y?"))try{await l.g3.cancel(h._id,"Hủy bởi admin"),p.default.success("Đ\xe3 hủy đơn h\xe0ng");let{data:t}=await l.g3.getById(e);x(t)}catch(e){p.default.error(e.message)}},children:"✕ Hủy đơn h\xe0ng"})]})]}),h.statusHistory&&h.statusHistory.length>0&&(0,r.jsxs)("div",{className:"card p-4",children:[r.jsx("h3",{className:"font-semibold mb-4",children:"Lịch sử trạng th\xe1i"}),r.jsx("div",{className:"space-y-3",children:h.statusHistory.map((e,t)=>(0,r.jsxs)("div",{className:"flex items-center gap-4 text-sm",children:[r.jsx("div",{className:"w-2 h-2 bg-primary-500 rounded-full"}),(0,r.jsxs)("div",{className:"flex-1",children:[r.jsx("span",{className:"font-medium",children:c.cL[e.status]}),r.jsx("span",{className:"text-dark-500 ml-2",children:(0,c.p6)(e.changedAt,!0)})]})]},t))})]})]}):null}},3278:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let r=(0,s(9858).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},4670:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$typeof:()=>n,__esModule:()=>a,default:()=>i});let r=(0,s(1481).createProxy)(String.raw`D:\APP\Test app QLBH w GG\frontend\src\app\dashboard\orders\[id]\page.tsx`),{__esModule:a,$$typeof:n}=r,i=r.default}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[100,766,59,712,5],()=>s(2586));module.exports=r})();