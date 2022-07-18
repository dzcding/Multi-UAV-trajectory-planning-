var lon = 118.817129  // 经度
var lat = 31.886063  // 纬度
var blc = 0.01  // 比例尺1:100，相片上一像素代表1厘米。
var w = 4000
// 图片高度h=3000像素
var h = 3000
// 水平分辨率72dpi
var horizontalResolution = 72
// 垂直分辨率72dpi
var verticalResolution = 72
// 光圈值f/2.8
// 曝光时间1/4秒
var exposureTime = 0.25
// 焦距4毫米
var focalLength = 4
// 35mm焦距22
// 若地面分辨率5cm/px，则一张图片可以照200x150米的区域。
// （1/2.3)英寸=11.04347826087毫米
// 常见的1/2.3英寸传感器长宽是cw6.17×ch4.55毫米，面积是28.0735平方毫米
var cw = 6.17
var ch = 4.55
// 所以大致估计像元尺寸是1.5\mum。所以航高H=5cm/px*4mm/1.5\mum=133米。
var pixelSize = 1.5
// 若航高为100米，则地面分辨率R=1.5\mum*100/4mm=3.75cm/px。
// 若用像素点坐标当做景物坐标，则比例尺=图上距离/实际距离=1/地面分辨率=1：3.75。
var flightHeight = 100
var R = pixelSize * 0.000001 * flightHeight / (4 * 0.001)
// 单张图像地面覆盖宽WD=R*w=148m。
var WD = R * w
// 单张图像地面覆盖高HD=R*h=112.5m。
var HD = R * h
// 因为曝光时间t=0.25秒。
// 像点位移值小于R*25%=0.9375m。
// 所以，飞行速度V要小于3.75米/秒。
// 相机倾斜角度a=30°（25°和45°之间都行。）。
var a = 30
// 旁向重叠度\deltastrip=航向重叠度\delta=66%。
var deltaStrip = 0.66
var delta = 0.66
// 航向间隔M=R*h*(1-\delta)=38.25米。
var M = R * h * (1 - delta)
// 航带间隔Mstrip=R*w*(1-\deltastrip)=51米。
var Mstrip = R * w * (1 - deltaStrip)
// 水平/横向视场角\thetaw=2*arctan(cw/2f)=1.3139259523933642=75.28241166484689°。
var thetaw = 2 * Math.atan(cw / (2 * focalLength))  // 此时thetaw是弧度。
thetaw = thetaw * (180 / Math.PI)  // 弧度转角度。
// thetaw  = thetaw * (Math.PI / 180)  // 角度转弧度。
// 垂直/纵向视场角\thetah=2*arctan(ch/2f)=1.0342491073161029=59.25810881438565°。
var thetah = 2 * Math.atan(ch / (2 * focalLength))
thetah = thetah * (180 / Math.PI)
// 航线与成图区域的外扩距离W+=H*tan(a-\thetah/2)=0.6474312398621277米，约为0.65米。
var extendedDistance = flightHeight * Math.tan((a - thetah / 2) * (Math.PI / 180))
// 航向间隔M=R*h*(1-\delta)=38.25米。
var M = R * h * (1 - delta)
// 航带间隔Mstrip=R*w*(1-\deltastrip)=51米。
var Mstrip = R * w * (1 - deltaStrip)


function copy_array(arrayJson){
    var copy_arrayJson = []
    for (var i= 0; i<arrayJson.length; i++) {
        var objJson = {"x":arrayJson[i].x, "y":arrayJson[i].y}
        copy_arrayJson.push(objJson)
    }
    return copy_arrayJson
}

//生成从minNum到maxNum的随机数
function randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.seededRandom()*minNum+1,10);
            break;
        case 2:
            return parseInt(Math.seededRandom()*(maxNum-minNum+1)+minNum,10);
            break;
        default:
            return 0;
            break;
    }
}
// 这里用的是叉积，正弦的判断
function multiply(p0,p1,p2){
    return((p1.x-p0.x)*(p2.y-p0.y)-(p2.x-p0.x)*(p1.y-p0.y));
}
// 生成多边形的凸包
function random_polygon_2_convex_polygon(pointSet){
    n = pointSet.length
    var ch=new Array();
    var i,j,k=0,top=2;
    var tmp=new Object();
    // 找到一个基点，基本就是保证最下面最左面的点
    for(i=1;i<n;i++){
        if( (pointSet[i].y<pointSet[k].y) ||
            ( (pointSet[i].y==pointSet[k].y) && (pointSet[i].x<pointSet[k].x) )
        ){
            k=i;
        }
    }

    tmp=pointSet[0];
    pointSet[0]=pointSet[k];
    pointSet[k]=tmp;

    use=n;
    for (i=1;i<use-1;i++){
        k=i;
        for (j=i+1;j<use;j++){
            var direct=multiply(pointSet[0],pointSet[k],pointSet[j]);
            if(direct>0){
                k=j;
            }else if(direct==0){
                // k j 同方向
                var dis=distance_no_sqrt(pointSet[0],pointSet[j])-distance_no_sqrt(pointSet[0],pointSet[k]);
                use--; // 也就是不要了
                if(dis>0){
                    // 保留j
                    // 把 k 就不要了
                    pointSet[k]=pointSet[j];
                    pointSet[j]=pointSet[use];
                    j--;
                }else{
                    tmp=pointSet[use];
                    pointSet[use]=pointSet[j];
                    pointSet[j]=tmp;
                }
            }
        }
        tmp=pointSet[i];
        pointSet[i]=pointSet[k];
        pointSet[k]=tmp;
    }

    ch.push(pointSet[0]);
    ch.push(pointSet[1]);
    ch.push(pointSet[2]);
    for (i=3;i<use;i++){
        while ( !(multiply(pointSet[i],ch[top-1],ch[top]) < 0 ) ){
            top--;
            ch.pop();
        }
        top++;
        ch.push(pointSet[i]);
    }
    return ch
}
function drawPointsforToponNS(leftPoint, rightPoint, behindPoint, M, Mstrip){
    var routeNSNum = Math.floor((leftPoint.y - behindPoint.y)/Mstrip) + 1 + 1
    var routeWENum = Math.floor((rightPoint.x - leftPoint.x)/M) + 1
    var pointofTop = []
    var lastX = leftPoint.x
    for(var i=0; i < routeNSNum + 1; i++){
        var copyPoint = {"x":lastX, "y":leftPoint.y}
        // copyPoint.x = leftPoint.x
        copyPoint.y = copyPoint.y - i * Mstrip
        var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
        pointofTop.push(copyCopyPoint)
        for(var j=1; j < routeWENum ; j++){
            if(i%2==0){
                copyPoint.x = copyPoint.x + M
                lastX = copyPoint.x
            }
            else{
                copyPoint.x = copyPoint.x - M
                lastX = copyPoint.x
            }
            var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
            pointofTop.push(copyCopyPoint)
        }
    }
    return pointofTop
}
// leftPoint.x < behindPoint.x && leftPoint.y < rightPoint.y
function drawPointsforToponWE(leftPoint, rightPoint, behindPoint, M, Mstrip){
    var routeWENum = Math.floor((behindPoint.x - leftPoint.x)/Mstrip) + 1 + 1
    var routeNSNum = Math.floor((rightPoint.y - leftPoint.y)/M) + 1
    var pointofTop = []
    var lastY = leftPoint.y
    for(var i=0; i < routeWENum + 1; i++){
        var copyPoint = {"x":leftPoint.x, "y":lastY}
        copyPoint.x = leftPoint.x + i * Mstrip
        // copyPoint.y = copyPoint.y
        var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
        pointofTop.push(copyCopyPoint)
        for(var j=1; j < routeNSNum ; j++){
            if(i%2==0){
                copyPoint.y = copyPoint.y + M
                lastY = copyPoint.y
            }
            else{
                copyPoint.y = copyPoint.y - M
                lastY = copyPoint.y
            }
            var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
            pointofTop.push(copyCopyPoint)
        }
    }
    return pointofTop
}
// leftPoint.y < behindPoint.y && leftPoint.x > rightPoint.x
function drawPointsforToponSN(leftPoint, rightPoint, behindPoint, M, Mstrip){
    var routeNSNum = Math.floor((behindPoint.y - leftPoint.y)/Mstrip) + 1 + 1
    var routeWENum = Math.floor((leftPoint.x - rightPoint.x)/M) + 1
    var pointofTop = []
    var lastX = leftPoint.x
    for(var i=0; i < routeNSNum + 1; i++){
        var copyPoint = {"x":lastX, "y":leftPoint.y}
        // copyPoint.x = leftPoint.x
        copyPoint.y = copyPoint.y + i * Mstrip
        var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
        pointofTop.push(copyCopyPoint)
        for(var j=1; j < routeWENum ; j++){
            if(i%2==0){
                copyPoint.x = copyPoint.x - M
                lastX = copyPoint.x
            }
            else{
                copyPoint.x = copyPoint.x + M
                lastX = copyPoint.x
            }
            var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
            pointofTop.push(copyCopyPoint)
        }
    }
    return pointofTop
}
// leftPoint.x > behindPoint.x && leftPoint.y > rightPoint.y
function drawPointsforToponEW(leftPoint, rightPoint, behindPoint, M, Mstrip){
    var routeWENum = Math.floor((leftPoint.x - behindPoint.x)/Mstrip) + 1 + 1
    var routeNSNum = Math.floor((leftPoint.y - rightPoint.y)/M) + 1
    var pointofTop = []
    var lastY = leftPoint.y
    for(var i=0; i < routeWENum + 1; i++){
        var copyPoint = {"x":leftPoint.x, "y":lastY}
        copyPoint.x = leftPoint.x - i * Mstrip
        // copyPoint.y = copyPoint.y
        var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
        pointofTop.push(copyCopyPoint)
        for(var j=1; j < routeNSNum ; j++){
            if(i%2==0){
                copyPoint.y = copyPoint.y - M
                lastY = copyPoint.y
            }
            else{
                copyPoint.y = copyPoint.y + M
                lastY = copyPoint.y
            }
            var copyCopyPoint = {"x":copyPoint.x, "y":copyPoint.y}
            pointofTop.push(copyCopyPoint)
        }
    }
    return pointofTop
}
function oblique(res)
{
    //draw_polygon(res, "#fff", "#080")
    // 求凸包重心
    var gravityCenterX = 0
    var gravityCenterY = 0
    for (var i=0; i<res.length; i++){
        gravityCenterX = gravityCenterX + res[i].x
        gravityCenterY = gravityCenterY + res[i].y
    }
    gravityCenterX = gravityCenterX * 1.0 / res.length
    gravityCenterY = gravityCenterY * 1.0 / res.length
    // context.beginPath();
    // context.fillStyle = "orange";
    // context.strokeStyle = "orange";
    // context.lineWidth = 1;
    // context.font = "normal 16px Arial";
    // context.arc(gravityCenterX, gravityCenterY, 3, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
    // context.fill();
    // context.stroke();
    // context.closePath();

    // 求需要的最大外扩多边形的顶点坐标。
    var maxRouteEndPoint = []
    for (var i=0; i<res.length; i++){
        var endPoint = {'x':0, 'y':0}
        vectorX = res[i].x - gravityCenterX
        vectorY = res[i].y - gravityCenterY
        // vectorX = vectorX * 0.4
        // vectorY = vectorY * 0.4
        endPoint.x = endPoint.x + res[i].x + vectorX
        endPoint.y = endPoint.y + res[i].y + vectorY
        maxRouteEndPoint.push(endPoint)
    }


    // 求单机航线的左端点
    function calculate_route_left_end_point(originPolygonPoints, routePolygonPoints){
        var routeLeftEndPoint = []
        for (var i=0; i<originPolygonPoints.length; i++){
            var endPoint = {'x':0, 'y':0}
            // document.writeln(i + '<br/>');
            var vectorX = 0
            var vectorY = 0
            if (i == originPolygonPoints.length-1){
                vectorX = originPolygonPoints[i].x - originPolygonPoints[0].x
                vectorY = originPolygonPoints[i].y - originPolygonPoints[0].y
            }
            else{
                vectorX = originPolygonPoints[i].x - originPolygonPoints[i+1].x
                vectorY = originPolygonPoints[i].y - originPolygonPoints[i+1].y
            }
            // vectorX = res[i].x - res[i+1].x
            // vectorY = res[i].y - res[i+1].y
            var verticalVectorX = vectorY
            var verticalVectorY = -1 * vectorX
            var a1 = 1.0 * verticalVectorY
            var b1 = -1.0 * verticalVectorX
            var c1 = originPolygonPoints[i].y *1.0 * verticalVectorX - 1.0 * originPolygonPoints[i].x * verticalVectorY
            // document.writeln(verticalVectorX + ' ' + verticalVectorY + '<br/>');
            // document.writeln(a1 + ' ' + b1 + ' ' + c1 + '<br/>');
            if (i == res.length-1){
                var parallelVectorX = originPolygonPoints[i].x - originPolygonPoints[0].x
                var parallelVectorY = originPolygonPoints[i].y - originPolygonPoints[0].y
            }
            else{
                var parallelVectorX = originPolygonPoints[i].x - originPolygonPoints[i+1].x
                var parallelVectorY = originPolygonPoints[i].y - originPolygonPoints[i+1].y
            }
            var a2 = 1.0 * parallelVectorY
            var b2 = -1.0 * parallelVectorX
            var c2 = routePolygonPoints[i*2].y *1.0 * parallelVectorX - 1.0 * routePolygonPoints[i*2].x * parallelVectorY
            endPoint.x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
            endPoint.y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
            routeLeftEndPoint.push(endPoint)
        }
        return routeLeftEndPoint
    }
    var oneMachineRouteLeftEndPoint = []
    for (var i=0; i<res.length; i++){
        var endPoint = {'x':0, 'y':0}
        // document.writeln(i + '<br/>');
        var vectorX = 0
        var vectorY = 0
        if (i == res.length-1){
            vectorX = res[i].x - res[0].x
            vectorY = res[i].y - res[0].y
        }
        else{
            vectorX = res[i].x - res[i+1].x
            vectorY = res[i].y - res[i+1].y
        }
        // vectorX = res[i].x - res[i+1].x
        // vectorY = res[i].y - res[i+1].y
        var verticalVectorX = vectorY
        var verticalVectorY = -1 * vectorX
        var a1 = 1.0 * verticalVectorY
        var b1 = -1.0 * verticalVectorX
        var c1 = res[i].y *1.0 * verticalVectorX - 1.0 * res[i].x * verticalVectorY
        // document.writeln(verticalVectorX + ' ' + verticalVectorY + '<br/>');
        // document.writeln(a1 + ' ' + b1 + ' ' + c1 + '<br/>');
        if (i == res.length-1){
            var parallelVectorX = res[i].x - res[0].x
            var parallelVectorY = res[i].y - res[0].y
        }
        else{
            var parallelVectorX = res[i].x - res[i+1].x
            var parallelVectorY = res[i].y - res[i+1].y
        }
        var a2 = 1.0 * parallelVectorY
        var b2 = -1.0 * parallelVectorX
        var c2 = maxRouteEndPoint[i].y *1.0 * parallelVectorX - 1.0 * maxRouteEndPoint[i].x * parallelVectorY
        endPoint.x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
        endPoint.y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
        oneMachineRouteLeftEndPoint.push(endPoint)
    }

    // 求单机航线的右端点
    function calculate_route_right_end_point(originPolygonPoints, routePolygonPoints){
        var routeRightEndPoint = []
        for (var i=0; i<originPolygonPoints.length; i++){
            var endPoint = {'x':0, 'y':0}
            // document.writeln(i + '<br/>');
            var vectorX = 0
            var vectorY = 0
            if (i == 0){
                vectorX = originPolygonPoints[i].x - originPolygonPoints[originPolygonPoints.length-1].x
                vectorY = originPolygonPoints[i].y - originPolygonPoints[originPolygonPoints.length-1].y
            }
            else{
                vectorX = originPolygonPoints[i].x - originPolygonPoints[i-1].x
                vectorY = originPolygonPoints[i].y - originPolygonPoints[i-1].y
            }
            // vectorX = res[i].x - res[i+1].x
            // vectorY = res[i].y - res[i+1].y
            var verticalVectorX = vectorY
            var verticalVectorY = -1 * vectorX
            var a1 = 1.0 * verticalVectorY
            var b1 = -1.0 * verticalVectorX
            var c1 = originPolygonPoints[i].y *1.0 * verticalVectorX - 1.0 * originPolygonPoints[i].x * verticalVectorY
            // document.writeln(verticalVectorX + ' ' + verticalVectorY + '<br/>');
            // document.writeln(a1 + ' ' + b1 + ' ' + c1 + '<br/>');
            if (i == 0){
                var parallelVectorX = originPolygonPoints[i].x - originPolygonPoints[originPolygonPoints.length-1].x
                var parallelVectorY = originPolygonPoints[i].y - originPolygonPoints[originPolygonPoints.length-1].y
            }
            else{
                var parallelVectorX = originPolygonPoints[i].x - originPolygonPoints[i-1].x
                var parallelVectorY = originPolygonPoints[i].y - originPolygonPoints[i-1].y
            }
            var a2 = 1.0 * parallelVectorY
            var b2 = -1.0 * parallelVectorX
            var c2 = 0
            if (i == 0){
                c2 = routePolygonPoints[routePolygonPoints.length-1].y *1.0 * parallelVectorX - 1.0 * routePolygonPoints[routePolygonPoints.length-1].x * parallelVectorY
            }
            else{
                c2 = routePolygonPoints[2*i-1].y *1.0 * parallelVectorX - 1.0 * routePolygonPoints[2*i-1].x * parallelVectorY
            }

            endPoint.x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
            endPoint.y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
            routeRightEndPoint.push(endPoint)

        }
        // drawCities(oneMachineRouteRightEndPoint)
        // print_array(oneMachineRouteRightEndPoint)
        // print_array(oneMachineRouteRightEndPoint)
        // 调整oneMachineRouteRightEndPoint中元素的位置，以和oneMachineRouteLeftEndPoint中的左端点对应。
        var remove_objJson = {"x":routeRightEndPoint[0].x, "y":routeRightEndPoint[0].y}
        routeRightEndPoint.splice(0, 1)  // 第一个参数为开始的位置，第二个参数为要删除的个数。
        routeRightEndPoint.push(remove_objJson)
        return routeRightEndPoint
    }
    var oneMachineRouteRightEndPoint = []
    for (var i=0; i<res.length; i++){
        var endPoint = {'x':0, 'y':0}
        // document.writeln(i + '<br/>');
        var vectorX = 0
        var vectorY = 0
        if (i == 0){
            vectorX = res[i].x - res[res.length-1].x
            vectorY = res[i].y - res[res.length-1].y
        }
        else{
            vectorX = res[i].x - res[i-1].x
            vectorY = res[i].y - res[i-1].y
        }
        // vectorX = res[i].x - res[i+1].x
        // vectorY = res[i].y - res[i+1].y
        var verticalVectorX = vectorY
        var verticalVectorY = -1 * vectorX
        var a1 = 1.0 * verticalVectorY
        var b1 = -1.0 * verticalVectorX
        var c1 = res[i].y *1.0 * verticalVectorX - 1.0 * res[i].x * verticalVectorY
        // document.writeln(verticalVectorX + ' ' + verticalVectorY + '<br/>');
        // document.writeln(a1 + ' ' + b1 + ' ' + c1 + '<br/>');
        if (i == 0){
            var parallelVectorX = res[i].x - res[res.length-1].x
            var parallelVectorY = res[i].y - res[res.length-1].y
        }
        else{
            var parallelVectorX = res[i].x - res[i-1].x
            var parallelVectorY = res[i].y - res[i-1].y
        }
        var a2 = 1.0 * parallelVectorY
        var b2 = -1.0 * parallelVectorX
        var c2 = maxRouteEndPoint[i].y *1.0 * parallelVectorX - 1.0 * maxRouteEndPoint[i].x * parallelVectorY
        endPoint.x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1)
        endPoint.y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1)
        oneMachineRouteRightEndPoint.push(endPoint)
    }

    // 调整oneMachineRouteRightEndPoint中元素的位置，以和oneMachineRouteLeftEndPoint中的左端点对应。
    var remove_objJson = {"x":oneMachineRouteRightEndPoint[0].x, "y":oneMachineRouteRightEndPoint[0].y}
    oneMachineRouteRightEndPoint.splice(0, 1)  // 第一个参数为开始的位置，第二个参数为要删除的个数。
    oneMachineRouteRightEndPoint.push(remove_objJson)


    // 图片宽度w=4000像素
    var w = 4000
    // 图片高度h=3000像素
    var h = 3000
    // 水平分辨率72dpi
    var horizontalResolution = 72
    // 垂直分辨率72dpi
    var verticalResolution = 72
    // 光圈值f/2.8
    // 曝光时间1/4秒
    var exposureTime = 0.25
    // 焦距4毫米
    var focalLength = 4
    // 35mm焦距22
    // 若地面分辨率5cm/px，则一张图片可以照200x150米的区域。
    // （1/2.3)英寸=11.04347826087毫米
    // 常见的1/2.3英寸传感器长宽是cw6.17×ch4.55毫米，面积是28.0735平方毫米
    var cw = 6.17
    var ch = 4.55
    // 所以大致估计像元尺寸是1.5\mum。所以航高H=5cm/px*4mm/1.5\mum=133米。
    var pixelSize = 1.5
    // 若航高为100米，则地面分辨率R=1.5\mum*100/4mm=3.75cm/px。
    // 若用像素点坐标当做景物坐标，则比例尺=图上距离/实际距离=1/地面分辨率=1：3.75。
    var flightHeight = 100
    var R = pixelSize * 0.000001 * flightHeight / (4 * 0.001)
    // 单张图像地面覆盖宽WD=R*w=148m。
    var WD = R * w
    // 单张图像地面覆盖高HD=R*h=112.5m。
    var HD = R * h
    // 因为曝光时间t=0.25秒。
    // 像点位移值小于R*25%=0.9375m。
    // 所以，飞行速度V要小于3.75米/秒。
    // 相机倾斜角度a=30°（25°和45°之间都行。）。
    var a = 30
    // 旁向重叠度\deltastrip=航向重叠度\delta=66%。
    var deltaStrip = 0.66
    var delta = 0.66
    // 航向间隔M=R*h*(1-\delta)=38.25米。
    var M = R * h * (1 - delta)
    // 航带间隔Mstrip=R*w*(1-\deltastrip)=51米。
    var Mstrip = R * w * (1 - deltaStrip)
    // 水平/横向视场角\thetaw=2*arctan(cw/2f)=1.3139259523933642=75.28241166484689°。
    var thetaw = 2 * Math.atan(cw / (2 * focalLength))  // 此时thetaw是弧度。
    thetaw = thetaw * (180 / Math.PI)  // 弧度转角度。
    // thetaw  = thetaw * (Math.PI / 180)  // 角度转弧度。
    // 垂直/纵向视场角\thetah=2*arctan(ch/2f)=1.0342491073161029=59.25810881438565°。
    var thetah = 2 * Math.atan(ch / (2 * focalLength))
    thetah = thetah * (180 / Math.PI)
    // 航线与成图区域的外扩距离W+=H*tan(a-\thetah/2)=0.6474312398621277米，约为0.65米。
    var extendedDistance = flightHeight * Math.tan((a - thetah / 2) * (Math.PI / 180))
    // extendedDistance = 0
    //document.writeln(R + ' ' + M + ' ' + Mstrip + ' ' + thetaw + ' ' + thetah + ' ' + extendedDistance + '<br/>');

    function calculate_points_of_polygon_designated_distance_between_bases(centerVertexCoordinate, pointsCoordinateofPolygon, designatedDistance){
        var extendedPolygonPoints = []
        for (var i=0; i<pointsCoordinateofPolygon.length; i++){
            var endPoint = {'x':0, 'y':0}
            // document.writeln(i + '<br/>');
            // parallelVectorX,parallelVectorY表示多边形某一边的方向向量。
            var parallelVectorX = 0
            var parallelVectorY = 0
            if (i == pointsCoordinateofPolygon.length-1){
                parallelVectorX = pointsCoordinateofPolygon[i].x - pointsCoordinateofPolygon[0].x
                parallelVectorY = pointsCoordinateofPolygon[i].y - pointsCoordinateofPolygon[0].y
            }
            else{
                parallelVectorX = pointsCoordinateofPolygon[i].x - pointsCoordinateofPolygon[i+1].x
                parallelVectorY = pointsCoordinateofPolygon[i].y - pointsCoordinateofPolygon[i+1].y
            }
            var a2 = 1.0 * parallelVectorY
            var b2 = -1.0 * parallelVectorX
            var c2 = pointsCoordinateofPolygon[i].y *1.0 * parallelVectorX - 1.0 * pointsCoordinateofPolygon[i].x * parallelVectorY
            var distanceformCentertoEdge = Math.abs(a2 * centerVertexCoordinate.x + b2 * centerVertexCoordinate.y + c2) / Math.sqrt(a2 * a2 + b2 * b2)
            var edgeProportion =  (distanceformCentertoEdge + designatedDistance) / distanceformCentertoEdge
            var vectorX = pointsCoordinateofPolygon[i].x - centerVertexCoordinate.x
            var vectorY = pointsCoordinateofPolygon[i].y - centerVertexCoordinate.y
            vectorX = vectorX * edgeProportion
            vectorY = vectorY * edgeProportion
            endPoint.x = centerVertexCoordinate.x + vectorX
            endPoint.y = centerVertexCoordinate.y + vectorY
            extendedPolygonPoints.push(endPoint)

            var point2Index = i
            if (i == pointsCoordinateofPolygon.length-1){
                point2Index = 0
            }
            else{
                point2Index = i + 1
            }
            endPoint = {'x':0, 'y':0}
            endPoint.x = centerVertexCoordinate.x + (pointsCoordinateofPolygon[point2Index].x - centerVertexCoordinate.x) * edgeProportion
            endPoint.y = centerVertexCoordinate.y + (pointsCoordinateofPolygon[point2Index].y - centerVertexCoordinate.y) * edgeProportion
            extendedPolygonPoints.push(endPoint)
        }
        return extendedPolygonPoints
    }
    gravityPoint = {'x':gravityCenterX, 'y':gravityCenterY}
    var firstExtendedPolygonPoints = calculate_points_of_polygon_designated_distance_between_bases(gravityPoint, res, extendedDistance)
    var secondExtendedPolygonPoints = calculate_points_of_polygon_designated_distance_between_bases(gravityPoint, res, extendedDistance+M)
    var thirdExtendedPolygonPoints = calculate_points_of_polygon_designated_distance_between_bases(gravityPoint, res, extendedDistance+M+M)
    var forthExtendedPolygonPoints = calculate_points_of_polygon_designated_distance_between_bases(gravityPoint, res, extendedDistance+M+M+M)
    var firstRouteLeftEndPoint = calculate_route_left_end_point(res, firstExtendedPolygonPoints)
    var firstRouteRightEndPoint = calculate_route_right_end_point(res, firstExtendedPolygonPoints)
    var secondRouteLeftEndPoint = calculate_route_left_end_point(res, secondExtendedPolygonPoints)
    var secondRouteRightEndPoint = calculate_route_right_end_point(res, secondExtendedPolygonPoints)
    var thirdRouteLeftEndPoint = calculate_route_left_end_point(res, thirdExtendedPolygonPoints)
    var thirdRouteRightEndPoint = calculate_route_right_end_point(res, thirdExtendedPolygonPoints)
    var forthRouteLeftEndPoint = calculate_route_left_end_point(res, forthExtendedPolygonPoints)
    var forthRouteRightEndPoint = calculate_route_right_end_point(res, forthExtendedPolygonPoints)

    // 求凸包重心
    var gravityCenterX = 0
    var gravityCenterY = 0
    for (var i=0; i<res.length; i++){
        gravityCenterX = gravityCenterX + res[i].x
        gravityCenterY = gravityCenterY + res[i].y
    }
    gravityCenterX = gravityCenterX * 1.0 / res.length
    gravityCenterY = gravityCenterY * 1.0 / res.length
// 计算边的垂直方向和正北方向之间的夹角。
    function calculate_vertical_vector_theta(originPolygonPointsNow,originPolygonPointsNext){
        var vectorX = 0
        var vectorY = 0
        vectorX = res[originPolygonPointsNow].x - res[originPolygonPointsNext].x
        vectorY = res[originPolygonPointsNow].y - res[originPolygonPointsNext].y
        var verticalVectorX = vectorY
        var verticalVectorY = -1 * vectorX
        if((gravityCenterX-res[originPolygonPointsNow].x)*verticalVectorX+(gravityCenterY-res[originPolygonPointsNow].y)*verticalVectorY<0){
            verticalVectorX = -1 * verticalVectorX
            verticalVectorY = -1 * verticalVectorY
        }
        var verticalVectorThetaCos = verticalVectorY/Math.sqrt(verticalVectorX*verticalVectorX+verticalVectorY*verticalVectorY)
        var verticalVectorTheta = Math.acos(verticalVectorThetaCos) * (180 / Math.PI) //此时单位是角度。
        if(verticalVectorX<0){
            verticalVectorTheta = -1 * verticalVectorTheta
        }
        return verticalVectorTheta
    }
// 一种生成倾斜摄影轨迹的方法，主要用于采集侧面纹理。
    function calculate_rounte_point_1(leftEndPoint, rightEndPoint, distanceBetweenPoints){
        var rountePoint = []
        for(var i=0; i<leftEndPoint.length; i++){
            var vectorX = rightEndPoint[i].x - leftEndPoint[i].x
            var vectorY = rightEndPoint[i].y - leftEndPoint[i].y
            var polygonPointsNum = res.length
            var originPolygonPointsNow = 0
            var originPolygonPointsNext = 0
            if (i%polygonPointsNum == polygonPointsNum-1){
                originPolygonPointsNow=res.length - 1
                originPolygonPointsNext=0
            }
            else{
                originPolygonPointsNow=i%polygonPointsNum
                originPolygonPointsNext=i%polygonPointsNum+1
            }
            var yawTheta = calculate_vertical_vector_theta(originPolygonPointsNow,originPolygonPointsNext)
            var unitVectorX = vectorX / Math.sqrt(vectorX * vectorX + vectorY * vectorY)
            var unitVectorY = vectorY / Math.sqrt(vectorX * vectorX + vectorY * vectorY)
            var maxEdgeLength = Math.sqrt(vectorX * vectorX + vectorY * vectorY)
            var pointNumberinEdge = Math.floor(maxEdgeLength / distanceBetweenPoints) + 1
            //document.writeln(pointNumberinEdge + ' ' + unitVectorX + ' ' + unitVectorY + ' ' + thetaw + ' ' + thetah + ' ' + extendedDistance + '<br/>');
            for(var j=0; j<pointNumberinEdge; j++){
                rountePoint.push({'x':leftEndPoint[i].x + j * unitVectorX * distanceBetweenPoints,'y':leftEndPoint[i].y + j * unitVectorY * distanceBetweenPoints, 'pitch':-60,'yaw':yawTheta, 'roll':0})
            }
        }
        return rountePoint
    }

    var leftEndPoint = [...firstRouteLeftEndPoint,...secondRouteLeftEndPoint,...thirdRouteLeftEndPoint,...forthRouteLeftEndPoint]
    var rightEndPoint = [...firstRouteRightEndPoint,...secondRouteRightEndPoint,...thirdRouteRightEndPoint,...forthRouteRightEndPoint]
    var rountePoint1 = calculate_rounte_point_1(leftEndPoint, rightEndPoint, Mstrip)//所得到的最终轨迹点
    return rountePoint1;

}
// 一种生成顶部倾斜摄影轨迹的方法，yaw的方向相对于正北方向。
function calculate_rounte_point_3(res){
    function xytogl(a){
        PI = 3.14159265358979323846
        R = 6371393.0
        z = {'x':0, 'y':0}
        z.x=a.x*180/(R*Math.cos(lat * (PI / 180))*PI)+lon
        z.y=a.y*180/R/PI+lat
        return z
    }
    function gltoxy(a){
        var PI = 3.14159265358979323846
        var R = 6371393.0
        var z = {'x':0, 'y':0}
        z.x=(a.x-lon)*PI*R*Math.cos(lat * (PI / 180))/180
        z.y=(a.y-lat)*PI*R/180
        return z
    }
    var rountePoint = []
    var resLon = []
    var resLat = []
    for (var i= 0; i<res.length; i++) {
        var resPointGL = xytogl(res[i])
        resLon.push(resPointGL.x)
        resLat.push(resPointGL.y)
    }

    var maxLon = Math.max(...resLon)
    var minLon = Math.min(...resLon)
    var maxLat = Math.max(...resLat)
    var minLat = Math.min(...resLat)
    var nwGL = {'x':maxLon, 'y':minLat}
    var neGL = {'x':maxLon, 'y':maxLat}
    var swGL = {'x':minLon, 'y':minLat}
    var seGL = {'x':minLon, 'y':maxLat}
    var nwXY = gltoxy(nwGL)
    var neXY = gltoxy(neGL)
    var swXY = gltoxy(swGL)
    var seXY = gltoxy(seGL)
    var resRec = []
    resRec.push(nwXY)
    resRec.push(neXY)
    resRec.push(seXY)
    resRec.push(swXY)
    var firstPointofTop = drawPointsforToponWE(resRec[3],resRec[2],resRec[0], M, Mstrip)
    var firstPointoofTopwithAngle = []
    for(var i=0; i < firstPointofTop.length; i++){
        var aangle = calculate_gimbal_angle2(1, 0, firstPointofTop[i], firstPointofTop[i+1])
        var pointwithAngle = {"x":firstPointofTop[i].x, "y":firstPointofTop[i].y, "pitch": aangle.pitch,"yaw": aangle.yaw, "roll":aangle.roll}
        firstPointoofTopwithAngle.push(pointwithAngle)
    }
    firstPointofTop = firstPointoofTopwithAngle

    var secondPointofTop = drawPointsforToponNS(resRec[2],resRec[1],resRec[3], M, Mstrip)
    var secondPointoofTopwithAngle = []
    for(var i=0; i < secondPointofTop.length; i++){
        var aangle = calculate_gimbal_angle2(0, -1, secondPointofTop[i], secondPointofTop[i+1])
        var pointwithAngle = {"x":secondPointofTop[i].x, "y":secondPointofTop[i].y, "pitch": aangle.pitch,"yaw": aangle.yaw, "roll":aangle.roll}
        secondPointoofTopwithAngle.push(pointwithAngle)
    }
    secondPointofTop = secondPointoofTopwithAngle

    var thirdPointofTop = drawPointsforToponSN(resRec[0],resRec[3],resRec[1], M, Mstrip)
    var thirdPointoofTopwithAngle = []
    for(var i=0; i < thirdPointofTop.length; i++){
        var aangle = calculate_gimbal_angle2(0, 1, thirdPointofTop[i], thirdPointofTop[i+1])
        var pointwithAngle = {"x":thirdPointofTop[i].x, "y":thirdPointofTop[i].y, "pitch": aangle.pitch,"yaw": aangle.yaw, "roll":aangle.roll}
        thirdPointoofTopwithAngle.push(pointwithAngle)
    }
    thirdPointofTop = thirdPointoofTopwithAngle

    var forthPointofTop = drawPointsforToponEW(resRec[1],resRec[0],resRec[2], M, Mstrip)
    var forthPointoofTopwithAngle = []
    for(var i=0; i < forthPointofTop.length; i++){
        var aangle = calculate_gimbal_angle2(-1, 0, forthPointofTop[i], forthPointofTop[i+1])
        var pointwithAngle = {"x":forthPointofTop[i].x, "y":forthPointofTop[i].y, "pitch": aangle.pitch,"yaw": aangle.yaw, "roll":aangle.roll}
        forthPointoofTopwithAngle.push(pointwithAngle)
    }
    forthPointofTop = forthPointoofTopwithAngle

    rountePoint = [...firstPointofTop,...secondPointofTop,...thirdPointofTop,...forthPointofTop]
    // drawVector2(forthPointofTop)
    return rountePoint
}
// 用yaw设置机头相对于正北的角度。
function calculate_gimbal_angle2(targetX, targetY, nowPoint){
    var angle = {"pitch": -60,"yaw": 0, "roll":0}
    if(targetX==-1&&targetY==0){
        angle = {"pitch": -60,"yaw": 90, "roll":0}
    }
    if(targetX==0&&targetY==1){
        angle = {"pitch": -60,"yaw": 180, "roll":0}
    }
    if(targetX==0&&targetY==-1){
        angle = {"pitch": -60,"yaw": 0, "roll":0}
    }
    if(targetX==1&&targetY==0){
        angle = {"pitch": -60,"yaw": -90, "roll":0}
    }
    return angle
}


