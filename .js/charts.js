
/* Copyright (C) 2012 Paul Halliday <paul.halliday@gmail.com> */

function math(stamp) {
    p = stamp.split(":");
    c = p[0] * 60 + p[1];
    return c;
}

function chartInterval(data) {

    ct = data.split(",");

    var hours = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    $.each(ct, function(a,b) {
        parts = b.split(":");

        switch (parts[0]) {
            case '00': hours[0] = hours[0] + 1; break;
            case '01': hours[1] = hours[1] + 1;  break;
            case '02': hours[2] = hours[2] + 1;  break;
            case '03': hours[3] = hours[3] + 1;  break;
            case '04': hours[4] = hours[4] + 1;  break;
            case '05': hours[5] = hours[5] + 1;  break;
            case '06': hours[6] = hours[6] + 1;  break;
            case '07': hours[7] = hours[7] + 1;  break;
            case '08': hours[8] = hours[8] + 1;  break;
            case '09': hours[9] = hours[9] + 1;  break;
            case '10': hours[10] = hours[10] + 1; break;
            case '11': hours[11] = hours[11] + 1; break;
            case '12': hours[12] = hours[12] + 1; break;
            case '13': hours[13] = hours[13] + 1; break;
            case '14': hours[14] = hours[14] + 1; break;
            case '15': hours[15] = hours[15] + 1; break;
            case '16': hours[16] = hours[16] + 1; break;
            case '17': hours[17] = hours[17] + 1; break;
            case '18': hours[18] = hours[18] + 1; break;
            case '19': hours[19] = hours[19] + 1; break;
            case '20': hours[20] = hours[20] + 1; break;
            case '21': hours[21] = hours[21] + 1; break;
            case '22': hours[22] = hours[22] + 1; break;
            case '23': hours[23] = hours[23] + 1; break;
        }
    });

    var bar = new RGraph.Bar('chart_timestamps', hours);
    bar.Set('chart.labels', ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']);
    bar.Set('chart.gutter.bottom', 50);
    bar.Set('chart.gutter.left', 50);
    bar.Set('chart.gutter.right', 50);
    bar.Set('chart.strokestyle', '#c9c9c9');
    bar.Set('chart.colors', ['rgba(0, 0, 0, 0.1)']);
    bar.Set('chart.labels.above', 'true');
    bar.Set('chart.text.font', 'verdana');
    bar.Set('chart.yaxispos', 'left');
    bar.Set('chart.xmax', 24);
    bar.Set('chart.background.grid', true);
    bar.Set('chart.background.grid.autofit', true);
    bar.Set('chart.background.grid.autofit.align', true);
    bar.Draw();
}
