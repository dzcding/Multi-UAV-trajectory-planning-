
var crtStepBtn = document.getElementById('crtStepBtn');//生成正视轨迹
var huadianBtn = document.getElementById('huadianBtn');
var zdhangxian = document.getElementById('zdhangxian');
var fenpei = document.getElementById('fenpei');
var spaceInp = document.getElementById('spaceInp');//返回旁向重叠率
var jiangeInp=document.getElementById('jiangeInp');//返回航向重叠率
var uav=document.getElementById('UAVnum');//返回飞机数量


var map = new BMap.Map("app");
var pointcen = new BMap.Point(118.826658,31.893161);//设立一个中心点坐标118是经度lng
//118.826658,31.893161
map.centerAndZoom(pointcen, 17);
map.enableScrollWheelZoom(true);
var point1 = new window.BMap.Point(118.826658,31.893161);//重要
var marker1= new window.BMap.Marker(point1);//重要
map.addOverlay(marker1);//重要
map.enableScrollWheelZoom(true);

var polyline = {
    layer: new BMap.Polyline([], {
        strokeColor: '#0f0',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
var polyline1 = {
    layer: new BMap.Polyline([], {
        strokeColor: '#f00',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
var polyline1plus = {
    layer: new BMap.Polyline([], {
        strokeColor: '#f00',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
var polyline2 = {
    layer: new BMap.Polyline([], {
        strokeColor: '#90f',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
var polyline3 = {
    layer: new BMap.Polyline([], {
        strokeColor: '#600',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}
var polyline4 = {
    layer: new BMap.Polyline([], {
        strokeColor: '#309',
        strokeWeight: 2,
        strokeOpacity: 1
    }),
    latlngs: []
}

var kes=[];
var tes=[];
var latlngzhengshi=[];
const jd={lng:118.817129,lat:31.886063};

cpRPA.setDistanceFn(distance);
cpRPA.setLatlng2PxFn(latlng2Px);//经纬度转换为px
cpRPA.setPx2LatlngFn(px2Latlng);//px转换为经纬度
var height1=100;
var height2=80;
var height3=80;
var PI = 3.14159265358979323846
var R = 6371393.0;


crtStepBtn.addEventListener('click', function() {
    renderPolyline();
})//画线
huadianBtn.addEventListener('click', function() {
    renderPolypoint();
})//画点
fenpei.addEventListener('click', function() {
    renderPolyline2();
})//画点

zdhangxian.addEventListener('click', function() {
    renderPolyline1();
})//画点
var numzd;
function choosefile () {
    var fileList = document.getElementById('files').files;
    var nameStr = '';
    nameStr += `${fileList[0].name}`;
    var reader = new FileReader();
    reader.readAsText(fileList[0], "UTF-8");
    reader.onload = function (e) {
        const content = e.target.result;
        console.log(content);
        numzd=texttonumzd(content);
        const textAreaVal = document.getElementById('text').value;
        document.getElementById('text').value = textAreaVal + content;
    }
    document.getElementById('name').append(nameStr);
}
function renderPolyline() {
    //118.820549,31.896938 118.830269,31.897505 118.830987,31.888982 118.821142,31.888568
    //let text="118.82301,31.894845 118.823495,31.890982 118.828831,31.890952 118.827969,31.895474 ";
    var pointset1 = document.getElementById("pointsetinput");//获取输入点集
    var tex=texttonum(pointset1.value);
    latlngzhengshi = cpRPA.setOptions({
        polygon: tex,//输入的多边形顶点经纬度
        rotate: 0,
        space: (R * w * (1 - parseFloat(spaceInp.value))) || 5
    });//输出的所有点坐标
    map.addOverlay(polyline.layer);//在地图附加折线层
    polyline.layer.setPath(
        mapLatlng2Bpoint(latlngzhengshi)//这是画线的
    )
}//获取正视轨迹并画正视轨迹线
//118.824412,31.894853 118.826352,31.894868 118.824268,31.892845 118.827178,31.892983
//118.828346,31.894738 118.829783,31.894815 118.829783,31.894815 118.829828,31.893213
function renderPolyline1() {//暂时停在这
    var point=0;
    //var zdpointset1 = document.getElementById("zhongdianpointsetinput");//获取重点区域输入点集
    while(point<numzd.length) {
        //var zdpointset1 = document.getElementById("zhongdianpointsetinput");//获取重点区域输入点集
        var pg1=[];
        for(var i=0;i<4;i++){
            pg1.push({
                lat:numzd[point+i].lat,
                lng:numzd[point+i].lng
            });
        }
        point=point+4;
        //var pg1 = texttonum(zdpointset1.value);
        var res = gltoxy(pg1);//重点区域点集

        var tes1 = oblique(res);

        var kes1 = calculate_rounte_point_3(res);

        //蒋所有重点区域点存储到总点集中
        for (var i = 0; i < tes1.length; i++) {
            tes.push({
                x: tes1[i].x,
                y: tes1[i].y,
                pitch: tes1[i].pitch,
                yaw: tes1[i].yaw,
                roll: tes1[i].roll
            })
        }
        for (var i = 0; i < kes1.length; i++) {
            kes.push({
                x: kes1[i].x,
                y: kes1[i].y,
                pitch: kes1[i].pitch,
                yaw: kes1[i].yaw,
                roll: kes1[i].roll
            })
        }
    }

    map.addOverlay(polyline1plus.layer);//在地图附加折线层
    polyline1plus.latlngs = xytogl(kes);//输出的所有点坐标，顶部轨迹
    polyline1plus.layer.setPath(
        mapLatlng2Bpoint(polyline1plus.latlngs)//这是画线的
    )

    map.addOverlay(polyline1.layer);//在地图附加折线层
    polyline1.latlngs = xytogl(tes);//输出的所有点坐标，侧面轨迹
    polyline1.layer.setPath(
        mapLatlng2Bpoint(polyline1.latlngs)//这是画线的
    )
    //zdpointset1.value="";
}//获取到间隔，凸多边形，倾斜角等参数后开始画重点区域线
var tesbest=[];
function renderPolyline2() {
    var k=parseFloat(uav.value) | 3;
    var res=[];
    var num=0;
    for(var i=0;i<latlngzhengshi.length-1;i++) {
        let rest = [];
        flysp = (pixelSize * 0.000001 * flightHeight / (4 * 0.001)) * h * (1 - parseFloat(jiangeInp.value));
        rest = duandian(latlngzhengshi[i], latlngzhengshi[i + 1], flysp);
        for (var j = 0; j < rest.length; j++) {
            res.push({
                lng: rest[j].lng,
                lat: rest[j].lat,
                alt: height1,
                Pitch: -90,
                Yaw: 0,
                Roll: 0,
                num:num
            });
            num++;
        }
    }
    //showpoint(res);
    for(var i=0;i<tes.length;i++)
    {
        res.push({
            lng:tes[i].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,
            lat:tes[i].y*180/(R*PI)+jd.lat,
            alt:height2,
            Pitch: tes[i].pitch,
            Yaw: tes[i].yaw,
            Roll: tes[i].roll,
            num:num
        });
        num++;
    }
    for(var i=0;i<kes.length;i++)
    {
        res.push({
            lng:kes[i].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,
            lat:kes[i].y*180/(R*PI)+jd.lat,
            alt:height3,
            Pitch: kes[i].pitch,
            Yaw: kes[i].yaw,
            Roll: kes[i].roll,
            num:num
        })
        num++;
    }
    let resxy=glatoxyz(res)
    var tes1=new Array(k);
    for(var i=0;i<k;i++)//k个空类
    {
        tes1[i]=[];
    }
    kmean(resxy,k,tes1)

    map.addOverlay(polyline2.layer);//在地图附加折线层
    polyline2.latlngs=xyztogla(TSP(tes1[0]));
    polyline2.layer.setPath(
        mapLatlng2Bpoint(polyline2.latlngs)//这是画线的
    )
    map.addOverlay(polyline3.layer);//在地图附加折线层
    polyline3.latlngs=xyztogla(TSP(tes1[1]));
    polyline3.layer.setPath(
        mapLatlng2Bpoint(polyline3.latlngs)//这是画线的
    )
    map.addOverlay(polyline4.layer);//在地图附加折线层
    polyline4.latlngs=xyztogla(TSP(tes1[2]));
    polyline4.layer.setPath(
        mapLatlng2Bpoint(polyline4.latlngs)//这是画线的
    )

}//画多机分配后的轨迹
function renderPolypoint() {
    var k=parseFloat(uav.value) | 3;
    var res=[];
    var num=0;
    for(var i=0;i<latlngzhengshi.length-1;i++) {
        let rest = [];
        flysp = (pixelSize * 0.000001 * flightHeight / (4 * 0.001)) * h * (1 - parseFloat(jiangeInp.value));
        rest = duandian(latlngzhengshi[i], latlngzhengshi[i + 1], flysp);
        for (var j = 0; j < rest.length; j++) {
            res.push({
                lng: rest[j].lng,
                lat: rest[j].lat,
                alt: height1,
                Pitch: -90,
                Yaw: 0,
                Roll: 0,
                num:num
            });
            num++;
        }
    }
    //showpoint(res);
    for(var i=0;i<tes.length;i++)
    {
        res.push({
            lng:tes[i].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,
            lat:tes[i].y*180/(R*PI)+jd.lat,
            alt:height2,
            Pitch: tes[i].pitch,
            Yaw: tes[i].yaw,
            Roll: tes[i].roll,
            num:num
        });
        num++;
    }
    for(var i=0;i<kes.length;i++)
    {
        res.push({
            lng:kes[i].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,
            lat:kes[i].y*180/(R*PI)+jd.lat,
            alt:height3,
            Pitch: kes[i].pitch,
            Yaw: kes[i].yaw,
            Roll: kes[i].roll,
            num:num
        })
        num++;
    }
    k=parseFloat(uav.value);
    var jjson = []
    if(k!=1) {
        let resxy = glatoxyz(res)
        var tes1 = new Array(k);
        for (var i = 0; i < k; i++)//k个空类
        {
            tes1[i] = [];
        }
        console.log(res.length);
        console.log(resxy.length);
        kmean(resxy, k, tes1)

        var maxlen = 0;
        var numtes = new Array(k);
        for (var i = 0; i < k; i++)//找到最大长度
        {
            numtes[i] = tes1[i].length;
            console.log(numtes[i]);
            if (numtes[i] > maxlen) maxlen = numtes[i];

        }
        var tesbest1 = new Array(k);
        for (var i = 0; i < k; i++) {
            tesbest1[i] = xyztogla(TSP(tes1[i]));
        }
        // var pes=glatoxyz(res);//可简化
        // var maxlen=pes.length;
        // var tesbest1=TSP(pes);
        // var tesbest=xyztogla(tesbest1);
        //var linelong=calcDistance(tesbest1);
        for (var j = 0; j < maxlen; j++) {
            for (var i = 0; i < k; i++) {
                if (numtes[i] > j) {
                    if (tesbest1[i][j].alt == height1) {
                        jjson.push({
                            Action_type: 1,
                            CID: i + 1,
                            Lon: tesbest1[i][j].lng,
                            Lat: tesbest1[i][j].lat,
                            Gimbal: {Pitch: -90, Yaw: 0, Roll: 0},
                            Alt: tesbest1[i][j].alt,
                            num: tesbest1[i][j].num,
                            Step: 3,
                            Sync: true
                        })
                    } else {
                        jjson.push({
                            Action_type: 1,
                            CID: i + 1,
                            Lon: tesbest1[i][j].lng,
                            Lat: tesbest1[i][j].lat,
                            Gimbal: {Pitch: tesbest1[i][j].Pitch, Yaw: tesbest1[i][j].Yaw, Roll: tesbest1[i][j].Roll},
                            Alt: tesbest1[i][j].alt,
                            num: tesbest1[i][j].num,
                            Step: 3,
                            Sync: true
                        })
                    }
                }
            }

        }
    }
    else{
        let resxy = glatoxyz(res);
        var tesbest1=xyztogla(TSP(resxy));
        maxlen=tesbest1.length;
        for (var j = 0; j < maxlen; j++) {
                        jjson.push({
                            Action_type: 1,
                            CID: 1,
                            Lon: tesbest1[j].lng,
                            Lat: tesbest1[j].lat,
                            Gimbal: {Pitch: tesbest1[j].Pitch, Yaw: tesbest1[j].Yaw, Roll: tesbest1[j].Roll},
                            Alt: tesbest1[j].alt,
                            num: tesbest1[j].num,
                            Step: 3,
                            Sync: true
                        })

        }

    }
    //var jjson1=bd09togcj02(jjson);
    var zspoint=[];
    for(var i=0;i<jjson.length;i++)
    {
        zspoint.push({
            Lat:jjson[i].Lat

        })
    }
    contentall=JSON.stringify(jjson,null,4);;
    var blob = new Blob([contentall], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "save.json");
}//获取到间隔，凸多边形，倾斜角等参数后开始画点
function mapLatlng2Bpoint(arr) {
    var a = [];
    for (var i = 0; i < arr.length; i++) {
        a.push(new BMap.Point(arr[i].lng, arr[i].lat));
    }
    return a
}
function gltoxy(a)
{
    const PI = 3.14159265358979323846;
    const R = 6371393;
    if(!Array.isArray(a)){
        var z=new Object();
        z.x=(a.lng-jd.lng)*PI*R*Math.cos(jd.lat)/180;
        z.y=(a.lat-jd.lat)*PI*R/180;
        return z;
    }
    else{
        var z=[]
        for(var j=0;j<a.length;j++)
        {
            z.push({x:(a[j].lng-jd.lng)*PI*R*Math.cos(jd.lat)/180,y:(a[j].lat-jd.lat)*PI*R/180})
        }
        return z;
    }
}
function xytogl(a)
{
    const PI = 3.14159265358979323846;
    const R = 6371393;
    if(!Array.isArray(a)){
        var z=new Object();
        z.lat=a.y*180/(R*PI)+jd.lat
        z.lng=a.x*180/(R*Math.cos(jd.lat)*PI)+jd.lng
        return z;
    }
    else{
        var z=[]
        for(var j=0;j<a.length;j++)
        {
            z.push({lng:a[j].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,lat:a[j].y*180/(R*PI)+jd.lat})
        }
        return z;
    }
}
function glatoxyz(a)
{
    const PI = 3.14159265358979323846;
    const R = 6371393;
    if(!Array.isArray(a)){
        var z=new Object();
        z.x=(a.lng-jd.lng)*PI*R*Math.cos(jd.lat)/180;
        z.y=(a.lat-jd.lat)*PI*R/180;
        z.z=a.alt;
        z.Pitch=a.Pitch;
        z.Yaw=a.Yaw;
        z.Roll=a.Roll;
        z.num=a.num;
        return z;
    }
    else{
        var z=[]
        for(var j=0;j<a.length;j++)
        {
            z.push({
                x:(a[j].lng-jd.lng)*PI*R*Math.cos(jd.lat)/180,
                y:(a[j].lat-jd.lat)*PI*R/180,
                z:a[j].alt,
                Pitch: a[j].Pitch,
                Yaw: a[j].Yaw,
                Roll: a[j].Roll,
                num: a[j].num
            })
        }
        return z;
    }
}

function xyztogla(a)
{
    const PI = 3.14159265358979323846;
    const R = 6371393;
    if(!Array.isArray(a)){
        var z=new Object();
        z.lat=a.y*180/(R*PI)+jd.lat
        z.lng=a.x*180/(R*Math.cos(jd.lat)*PI)+jd.lng
        z.alt=a.z
        z.Pitch=a.Pitch;
        z.Yaw=a.Yaw;
        z.Roll=a.Roll;
        z.num=a.num;
        return z;
    }
    else{
        var z=[]
        for(var j=0;j<a.length;j++)
        {
            z.push({
                lng:a[j].x*180/(R*Math.cos(jd.lat)*PI)+jd.lng,
                lat:a[j].y*180/(R*PI)+jd.lat,
                alt:a[j].z,
                Pitch: a[j].Pitch,
                Yaw: a[j].Yaw,
                Roll: a[j].Roll,
                num: a[j].num
            })
        }
        return z;
    }
}
function duandian(a,b,flysp)
{
    const PI = 3.14159265358979323846;
    const R = 6371393;
    var res=[];
    res.push(a);
    var d=gltoxy(a);
    var e=gltoxy(b);
    let c={x:d.x,y:d.y};
    dis=distancedzc(d,e);
    step=Math.floor(dis/flysp);
    coss=(e.x-d.x)/Math.sqrt((e.x-d.x)*(e.x-d.x)+(e.y-d.y)*(e.y-d.y));
    dx=flysp*coss;
    sins=(e.y-d.y)/Math.sqrt((e.x-d.x)*(e.x-d.x)+(e.y-d.y)*(e.y-d.y));
    dy=flysp*sins;
    for(var i=0;i<step;i++){
        c.x=c.x+dx;
        c.y=c.y+dy;
        res.push(xytogl({x:c.x,y:c.y}))
    }
    return res;
}//输入两个端点与节点距离，返回点集
function distancedzc(p1,p2)//计算点距离
{
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
}
function distance(p1, p2) {
    return distancedzc(gltoxy(p1),gltoxy(p2))
}

function latlng2Px(latlng) {
    z=gltoxy(latlng);

    return z
}

function px2Latlng(px) {
    return xytogl({x:px[0],y:px[1]})
}