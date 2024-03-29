(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.cpRPA = factory();
    }
}(this, function() {
    function Util() {}

    function setOptions(opt) {
        // if (!(opt.polygon instanceof Array)) {
        //     throw new Error('cpRPA: the "polygon" of options must be a Array like [{lat:Number,lng:Number}]')
        //     return
        // }
        // if (opt.rotate && typeof opt.rotate !== 'number') {
        //     throw new Error('cpRPA: the "rotate" of options must be a number!');
        //     return
        // }
        // if (opt.space && typeof opt.space !== 'number') {
        //     throw new Error('cpRPA: the "space" of options must be a number!');
        //     return
        // }
        var bounds = createPolygonBounds(opt.polygon);
        var rPolygon = createRotatePolygon(opt.polygon, bounds, -opt.rotate || 0);//旋转后得到的图形顶点

        if (!rPolygon) {
            throw new Error('cpRPA: You must call ".setLatlng2PxFn" and ".setPx2LatlngFn" methods before setOptions ');
            return
        }

        var rBounds = createPolygonBounds(rPolygon);
        var latline = createLats(rBounds, opt.space || 5);

        var line = [];//保存在凸多边形上与轨迹线相交的点
        var polyline = [];
        var check = null;
        for (var i = 0; i < latline.len; i++) {
            line = [];//初始化，保存每一个step与多边形的交点
            for (var j = 0; j < rPolygon.length; j++) {
                var nt = si(j + 1, rPolygon.length)
                check = createInlinePoint(
                    [rPolygon[j].lng, rPolygon[j].lat], [rPolygon[nt].lng, rPolygon[nt].lat],
                    rBounds.northLat - i * latline.lat
                );
                if (check) {
                    line.push(check)
                }
            }

            if (line.length < 2) {
                continue;
            }

            if (line[0][0] === line[1][0]) {
                continue;
            }

            if (i % 2) {
                polyline.push({
                    lat: line[0][1],
                    lng: Math.max(line[0][0], line[1][0]),
                }, {
                    lat: line[0][1],
                    lng: Math.min(line[0][0], line[1][0])
                })
            } else {
                polyline.push({
                    lat: line[0][1],
                    lng: Math.min(line[0][0], line[1][0]),
                }, {
                    lat: line[0][1],
                    lng: Math.max(line[0][0], line[1][0])
                })
            }
        }
        return createRotatePolygon(polyline, bounds, opt.rotate || 0)


    }//计算出了轨迹线和多边形的交点，返回的是一个点集（但只有轨迹线的两端）关键在此

    function setDistanceFn(fn) {
        if (typeof fn !== 'function') {
            throw new Error('setDistanceFn\'s argument must be a function');
            return
        }
        Util.prototype.distance = fn;
    }

    function setLatlng2PxFn(fn) {
        if (typeof fn !== 'function') {
            throw new Error('setLatlng2PxFn\'s argument must be a function');
            return
        }
        Util.prototype.latlng2Px = fn;
    }

    function setPx2LatlngFn(fn) {
        if (typeof fn !== 'function') {
            throw new Error('setPx2LatlngFn\'s argument must be a function');
            return
        }
        Util.prototype.px2Latlng = fn;
    }

    var U = new Util();

    function transform(x, y, tx, ty, deg, sx, sy) {//x,y点经过转换放缩和旋转
        var deg = deg * Math.PI / 180;
        if (!sy) sy = 1;
        if (!sx) sx = 1;
        return [
            sx * ((x - tx) * Math.cos(deg) - (y - ty) * Math.sin(deg)) + tx,
            sy * ((x - tx) * Math.sin(deg) + (y - ty) * Math.cos(deg)) + ty
        ]
    }

    function si(i, l) {
        if (i > l - 1) {
            return i - l;
        }
        if (i < 0) {
            return l + i;
        }
        return i;
    }//一个判断函数

    function createInlinePoint(p1, p2, y) {
        var s = p1[1] - p2[1];
        var x;
        if (s) {
            x = (y - p1[1]) * (p1[0] - p2[0]) / s + p1[0]
        } else {
            return false
        }
        if (x > p1[0] && x > p2[0]) {
            return false
        }
        if (x < p1[0] && x < p2[0]) {
            return false
        }
        return [x, y]
    }//输入两边界点并输入高度y，返回以两点为直线上对应y的点

    function createPolygonBounds(latlngs) {
        var lats = [];
        var lngs = [];
        for (var i = 0; i < latlngs.length; i++) {
            lats.push(latlngs[i].lat);
            lngs.push(latlngs[i].lng);
        }
        var maxLat = Math.max.apply(Math, lats);
        var maxLng = Math.max.apply(Math, lngs);
        var minLat = Math.min.apply(Math, lats);
        var minLng = Math.min.apply(Math, lngs);
        return {
            center: {
                lat: (maxLat + minLat) / 2,
                lng: (maxLng + minLng) / 2
            },
            latlngs: [{
                lat: maxLat,
                lng: minLng
            }, {
                lat: maxLat,
                lng: maxLng
            }, {
                lat: minLat,
                lng: maxLng
            }, {
                lat: minLat,
                lng: minLng
            }],
            northLat: maxLat
        }
    }//创造凸多边形外接矩形

    function createRotatePolygon(latlngs, bounds, rotate) {
        if (typeof U.latlng2Px !== 'function' && typeof U.px2Latlng !== 'function') {
            return false
        }
        var res = [],
            a, b;
        var c = U.latlng2Px(bounds.center);//将经纬度点数据转为像素点（坐标系）
        for (var i = 0; i < latlngs.length; i++) {
            a = U.latlng2Px(latlngs[i]);
            b = transform(a.x, a.y, c.x, c.y, rotate);//坐标变换
            res.push(U.px2Latlng(b));//坐标转换回经纬度
        }
        return res;
    }//读入多边形顶点坐标，外接bound,旋转角度，计算旋转后多边形顶点坐标

    function createLats(bounds, space) {
        var nw = bounds.latlngs[0];
        var sw = bounds.latlngs[3];

        if (typeof U.distance !== 'function') {
            throw new Error('You must call the ".setDistanceFn" method and set a function to calculate the distance!');
            return false
        }

        var distance = U.distance({
            lat: nw.lat,
            lng: nw.lng
        }, {
            lat: sw.lat,
            lng: sw.lng
        });
        var steps = parseInt(distance / space / 2);//通过外接矩形就散间隔
        var lats = (nw.lat - sw.lat) / steps;
        return {
            len: steps,
            lat: lats
        }
    }//以经度（竖直画轨迹线）返回线的数量和精度间隔

    function getPolygonArea(polygon) {
        var S = 0;
        for (var i = 0; i < polygon.length; i++) {
            S += X(polygon[i]) * Y(polygon[si(i + 1, polygon.length)]) - Y(polygon[i]) * X(polygon[si(i + 1, polygon.length)])
        }
        return Math.abs(S) / 2

        function X(latlng) {
            return latlng.lng * lng2m(latlng);
        }

        function Y(latlng) {
            return latlng.lat * lat2m(latlng);
        }
    }

    function getPolylineArea(polyline, space) {
        var S = 0;
        space = space || 5
        for (var i = 0; i < polyline.length; i += 2) {
            var j = si(i + 1, polyline.length);
            S += U.distance(polyline[i], polyline[j]);
        }
        return S * space * 2
    }

    function lat2m(latlng) {
        return U.distance(latlng, {
            lat: latlng.lat + 1,
            lng: latlng.lng
        })
    }

    function lng2m(latlng) {
        return U.distance(latlng, {
            lat: latlng.lat,
            lng: latlng.lng + 1
        });
    }


    return {
        setOptions: setOptions,
        setDistanceFn: setDistanceFn,
        setLatlng2PxFn: setLatlng2PxFn,
        setPx2LatlngFn: setPx2LatlngFn,
        getPolygonArea: getPolygonArea,
        getPolylineArea: getPolylineArea
    }
}));