function distancedzc1(p1,p2)//计算点距离
{
    //return(sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)));
    return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y)+(p1.z-p2.z)*(p1.z-p2.z));
}
function TSP(str)
{
    var recordDistance = calcDistance(str);
    let bestEver = str.slice();
    for(var i=0;i<str.length;i++)
    {
        var strmin=str;
        var temp;
        temp=strmin[0];
        strmin[0]=strmin[i];
        strmin[i]=temp;
        for(var j=1;j<strmin.length;j++)
        {
            var dismin=distancedzc1(strmin[j-1],strmin[j]);
            var disminzb=j;
            for(var k=j;k<strmin.length;k++)
            {
                if(distancedzc1(strmin[j-1],strmin[k])<dismin){
                    dismin=distancedzc1(strmin[j-1],strmin[k]);
                    disminzb=k;
                }
            }
            var tmp;
            tmp=strmin[j];
            strmin[j]=strmin[disminzb];
            strmin[disminzb]=tmp;
        }
        if(calcDistance(strmin)<recordDistance){
            recordDistance=calcDistance(strmin);
            bestEver=strmin.slice();
        }
    }
    for(var j=0;j<(bestEver.length-1);j++)
    {
        var i=j+2;
        while(distancedzc1(bestEver[j],bestEver[j+1])<=0.5)
        {
            var temp;
            temp=bestEver[i];
            bestEver[i]=bestEver[j+1];
            bestEver[j+1]=temp;
            i++;
        }
    }
    return bestEver;
}
function calcDistance(points) {
    var sum = 0;
    for (var i = 0; i < points.length - 1; i++) {
        var d = distancedzc1(points[i],points[i + 1]);
        sum += d;
    }
    return sum;
}
function disum(p,res)
{
    var sum=0;
    for(var i=0;i<res.length;i++)
    {
        sum=sum+distancedzc1(p,res[i]);
    }
    return sum;
}
function donchange(a,b)
{
    for(var i=0;i<a.length;i++)
    {
        if(a[i].x!=b[i].x || a[i].y!=b[i].y)return 0;
    }
    return 1;
}
function kmean(q,k,res)
{
    var xingnew=new Array(k);
    var xingold=new Array(k);
    for(var i=0;i<k;i++)//赋值初试中心点
    {
        xingold[i]=q[i];
        xingnew[i]=q[0];
    }
    var n=0;
    while(!donchange(xingold,xingnew)) {
        if(n!=0) {
            for (var i = 0; i < k; i++)//赋值初试中心点
            {
                xingold[i] = xingnew[i];
            }
        }
        for(var i=0;i<k;i++)//清空类别队列
        {
            res[i]=[];
        }
        for (var i = k - 1; i < q.length; i++) {
            var dismin = distancedzc1(q[i], xingold[0]), dismin1 = 0;
            for (var j = 1; j < k; j++) {
                if (distancedzc1(q[i], xingold[j]) < dismin) dismin = distancedzc1(q[i], xingold[j]), dismin1 = j;
            }
            res[dismin1].push(q[i]);
        }
        for (var i = 0; i < k; i++) {
            var dismin = disum(res[i][0], res[i]), dismin1 = 0;
            for (var j = 0; j < res[i].length; j++) {
                if (disum(res[i][j], res[i]) < dismin) dismin = disum(res[i][j], res[i]), dismin1 = j;
            }
            xingnew[i] = res[i][dismin1];
        }
        n++;
    }

}
function bd09togcj02(q) {
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    if(!Array.isArray(q)){
        var gg=new Object();
        var x = q.Lon - 0.0065;
        var y = q.Lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        gg.Action_type=1;
        gg.CID=q.CID;
        gg.Lon = z * Math.cos(theta);
        gg.Lat = z * Math.sin(theta);
        gg.Gimbal.Pitch=q.Gimbal.Pitch;
        gg.Gimbal.Yaw=Math.round(q.Gimbal.Yaw);
        gg.Gimbal.Roll=q.Gimbal.Roll;
        gg.Alt=q.Alt;
        gg.Step=3;
        gg.Sync=true;
        gg.num=q.num;
        return gg;
    }
    else{
        var gg=[];
        for(var j=0;j<q.length;j++)
        {
            var x = q[j].Lon - 0.0065;
            var y = q[j].Lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
            gg.push({
                Action_type: 1,
                CID: q[j].CID,
                Lon: z * Math.cos(theta),
                Lat: z * Math.sin(theta),
                Gimbal: {Pitch: q[j].Gimbal.Pitch, Yaw: Math.round(q[j].Gimbal.Yaw), Roll: q[j].Gimbal.Roll},
                Alt: q[j].Alt,
                num: q[j].num,
                Step: 3,
                Sync: true
            })
        }
        return gg;
    }

}
function texttonum(text){
    var nums=new String();
    var ll=[];
    var lat,lng;
    for(var i=0;i<text.length;i++)
    {
        if(text[i]!=',' && text[i]!=' '){
            nums+=text[i];
        }
        else{
            if(text[i]==','){
                lng=parseFloat(nums);
            }
            else{
                lat=parseFloat(nums)
                ll.push({
                    lat:lat,
                    lng:lng
                })
            }
            nums="";
        }
    }
    return ll;
}
function texttonumzd(text){
    var nums=new String();
    var ll=[];
    var lat;
    var lng;
    let js=0;
    let point=0;
    for(var i=0;i<text.length;i++)
    {
        if(text[i]!=',' && text[i]!=';' && text[i]!=' '){
            nums+=text[i];
        }
        else{
            if(text[i]==','){
                if(js==0){
                    lat=parseFloat(nums);
                    js=1;
                }
                else{
                    lng=parseFloat(nums);
                    js=0;
                    ll.push({
                        lat:lat,
                        lng:lng
                    });
                    point++;
                }
            }
            else{
                js=0;
                lng=parseFloat(nums);
                var x=new Object();
                x.lat=lat;
                x.lng=lng;
                ll.push({
                    lat:ll[point-1].lat,
                    lng:x.lng
                });
                ll.push({
                    lat:x.lat,
                    lng:x.lng
                });
                ll.push({
                    lat:x.lat,
                    lng:ll[point-1].lng
                });
                point+=3;
            }
            nums="";
        }
    }
    return ll;
}