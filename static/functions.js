function createUUID(){
    let uuid_ = "";
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    for (let i = 0; i < 8; i++) {
        uuid_ += chars[Math.round(Math.random() * (chars.length-1))];
    }
    uuid_ += "-";
    for (let i = 0; i < 4; i++) {
        uuid_ += chars[Math.round(Math.random() * (chars.length-1))];
    }
    uuid_ += "-";
    for (let i = 0; i < 4; i++) {
        uuid_ += chars[Math.round(Math.random() * (chars.length-1))];
    }
    uuid_ += "-";
    for (let i = 0; i < 4; i++) {
        uuid_ += chars[Math.round(Math.random() * (chars.length-1))];
    }
    uuid_ += "-";
    for (let i = 0; i < 12; i++) {
        uuid_ += chars[Math.round(Math.random() * (chars.length-1))];
    }
    return uuid_;
}

function calcWin(arr, check_for, func){
    for (let x = 0; x < arr.length; x++) { // horizontal check
        var counter = 0;
        for (let x2 = 0; x2 < arr[x].length; x2++) {
            if (arr[x][x2] == check_for){
                counter += 1;
            }
            if (counter == arr[x].length){
                func("HR", x);
                return {"horizontal": x};
            }
        }
    }

    for (let x = 0; x < arr.length; x++) { // vertical check
        var counter = 0;
        for (let x2 = 0; x2 < arr[x].length; x2++) {
            if (arr[x2][x] == check_for){
                counter += 1;
            }
            if (counter == arr[x].length){
                func("VR", x);
                return {"vertical": x};
            }
        }
    }

    var counter = 0;
    for (let x = 0; x < arr.length; x++) {
        if (arr[x][x] == check_for){
            counter += 1;
        }
        if (counter == arr[x].length){
            func("TL_TO_BR");
            return "top_left to bottom_right";
        }
    }

    var counter = 0;
    for (let x = 0; x < arr.length; x++) {
        if (arr[x][arr.length-x-1] == check_for){
            counter += 1;
        }
        if (counter == arr[x].length){
            func("TR_TO_BL");
            return "top_right to bottom_left";
        }
    }
    return "none"
}

// let ta = [
//     [0, 0, 1],
//     [1, 1, 0],
//     [1, 0, 1]
// ]


function plane_to_3D_arr(md_arr){
    let cur_idx = 0;
    let arr_ = [[], [], []];
    for (let i = 0; i < md_arr.length; i++) {
        if (i % 3 == 0){
            cur_idx += 1;
        }
        arr_[cur_idx-1].push(md_arr[i]);
    }
    return arr_;
}

// let s_a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// console.log(plane_to_3D_arr(s_a));
// console.log(calcWin(ta, 1));