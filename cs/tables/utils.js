const Canvas = require('canvas');
const path = require('path');
const fs = require('fs');

function getColumns(data, row=0) {
    return Object.keys(data[row] || {});
}

function columnData(data, index) {
    var list = [];

    for (const col of data) {
        if (!(index in col)) continue;

        const text = col[index].toString();
        if (text.indexOf('\n') != -1) {
            const multi = text.split('\n');
            for (const m of multi) {
                list.push(m);
            }
        } else {
            list.push(col[index]);
        }
    }
    return list;
}

function maxWidth(ctx, texts, oldFont) {
    ctx.font = oldFont.replace("normal", "bold");

    var width = 0;
    for (const i of texts) {
        const size = ctx.measureText(i);
        if (size.width > width) {
            width = size.width;
        }
    }

    ctx.font = oldFont;
    return width;
}

exports.rowLineCount = function (row) {
    var max = 1;
    for (const r of Object.values(row)) {
        const multi = r.toString().split('\n');
        max = Math.max(max, multi.length);
    }
    return max;
};

exports.maxColumnWidth = function(ctx, data, headers, col, padding, font) {
    const header = getColumns(data)[col];
    const headerText = headers[col];
    var list = columnData(data, header);
    list.push(headerText);
    return maxWidth(ctx, list, font) + padding;
};

exports.calcSize = function(ctx, data, headers, rowHeight, padding, fontHeight, font) {
    var [width, height] = [0, 0];

    for (var i = 0; i < headers.length; i++){
        const text = headers[i];
        const w = this.maxColumnWidth(ctx, data, headers, i, padding, font);

        width += w;
    }

    height = rowHeight;
    for (var row = 0; row < data.length; row++){
        const lines = this.rowLineCount(data[row]);
        height += (lines - 1) * fontHeight + rowHeight;
    }

    return [width, height];
};

exports.isTotalLine = function(data, row) {
    if (getColumns(data, row).indexOf('coin') == -1)
        return false;

    var coin = data[row]["coin"].toLowerCase();
    return coin.indexOf("total") != -1;
};

exports.timeColor = function(text, colors) {
    const check = (l) => text.indexOf(l) != -1;

    if (check('y')) return colors.red;
    if (check('d')) return colors.red;
    if (check('h')) return colors.yellow;
    if (check('m')) return colors.green;

    return colors.normal;
};

exports.drawText = function(ctx, text, x, y, width, padding, color, center=false) {
    const textWidth = ctx.measureText(text).width;
    const newX = center
        ? x + (width - textWidth) / 2
        : x + (width - textWidth) - (padding / 2);

    ctx.fillStyle = color;
    ctx.fillText(text, newX, y);;
};

exports.drawRect = function(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.rect(x, y, w, h);;
};

exports.saveFile = function(canvas, filename) {
    canvas.pngStream().pipe(fs.createWriteStream(filename));
};


exports.fileList = function(dir) {
    var list = [];

    fs.readdirSync(dir).forEach(file => {
        list.push(path.join(dir, file));
    });

    return list;
};

exports.getIcon = function(icons, name) {
    var tmp = `/${name.toLowerCase()}.`;
    for (var icon of icons) {
        if (icon.toLowerCase().indexOf(tmp) != -1) {
            return icon;
        }
    }

    return '';
};

exports.drawIcon = function(ctx, icon, x, y, width, fontSize) {
    const newX = x + (width - fontSize) / 2;
    const newY = y + fontSize / 2;

    const image = new Canvas.Image();
    image.src = icon;

    ctx.drawImage(image, newX, newY, fontSize, fontSize);
};
