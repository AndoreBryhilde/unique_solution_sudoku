let randgrid = { row: [], col: [] };
//檢查
// check duplicate number in col
const isColSafe = (grid, col, value) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}
// check duplicate number in row
const isRowSafe = (grid, row, value) => {
    for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
        if (grid[row][col] === value) return false;
    }
    return true;
}
// check duplicate number in 3x3 box
const isBoxSafe = (grid, box_row, box_col, value) => {
    for (let row = 0; row < CONSTANT.BOX_SIZE; row++) {
        for (let col = 0; col < CONSTANT.BOX_SIZE; col++) {
            if (grid[row + box_row][col + box_col] === value) return false;
        }
    }
    return true;
}
// check in row, col and 3x3 box
const isSafe = (grid, row, col, value) => {
    isSafecount++;
    return isColSafe(grid, col, value) && isRowSafe(grid, row, value) && isBoxSafe(grid, row - row % 3, col - col % 3, value) && value !== CONSTANT.UNASSIGNED;
}
//檢查是否完成
const isFullGrid = (grid) => {
    return grid.every((row) => {
        return row.every((value) => {
            return value !== CONSTANT.UNASSIGNED;
        });
    });
}
// find unassigned cell
const findUnassignedPos = (grid, pos) => {
    for (let row = 0; row < CONSTANT.GRID_SIZE; row++) {
        for (let col = 0; col < CONSTANT.GRID_SIZE; col++) {
            if (grid[row][col] === CONSTANT.UNASSIGNED) {
                pos.row = row;
                pos.col = col;
                return true;
            }
        }
    }
    return false;
}

// shuffle arr
const shuffleArray = (arr) => {
    let curr_index = arr.length;

    while (curr_index !== 0) {
        let rand_index = ~~(Math.random() * curr_index);
        curr_index -= 1;

        let temp = arr[curr_index];
        arr[curr_index] = arr[rand_index];
        arr[rand_index] = temp;
    }

    return arr;
}
//建立數獨
const sudokuCreate = (grid) => {
    let unassigned_pos = { row: -1, col: -1 }

    if (!findUnassignedPos(grid, unassigned_pos)) return true;

    let number_list = shuffleArray([...CONSTANT.NUMBERS]);

    let row = unassigned_pos.row;
    let col = unassigned_pos.col;

    number_list.forEach((num) => {
        if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (isFullGrid(grid)) {
                return true;
            } else {
                if (sudokuCreate(grid)) {
                    return true;
                }
            }
            grid[row][col] = CONSTANT.UNASSIGNED;
        } else {
            failrowcount[row]++;
        }
    });

    return isFullGrid(grid);
}
//隨機函數
const rand = () => Math.floor(Math.random() * CONSTANT.GRID_SIZE);
/*
//隨機移除格子
const removeCells = (grid, level) => {
    let res = [...grid];
    let attemps = level;
    while (attemps > 0) {
        let row = rand();
        let col = rand();
        while (res[row][col] === 0) {
            row = rand();
            col = rand();
        }
        randgrid['row'].push(row);
        randgrid['col'].push(col);
        res[row][col] = CONSTANT.UNASSIGNED;
        attemps--;
    }
    return res;
}
*/
//移除格子
const removeCells = (grid, level) => {
    let fixpos = [];
    let res = [...grid];
    let attemps = level;
    let temp;
    let count = 0;
    while (attemps > 0) {
        let row = rand();
        let col = rand();
        while (res[row][col] === 0 || fixpos.includes(`${row}${col}`)) {
            row = rand();
            col = rand();
        }
        temp = res[row][col];
        res[row][col] = CONSTANT.UNASSIGNED;
        if (!checkSudoku(res)) { res[row][col] = temp; fixpos.push(`${row}${col}`); count++; }
        if (count > 1000) { fixpos = []; }
        randgrid['row'].push(row);
        randgrid['col'].push(col);
        attemps--;
    }
    return res;
}
//接收空缺數，呼叫數度建立，挖空格，回傳
const sudokuGen = (level) => {
    isSafecount = 0; failrowcount = new Array(10).fill(0);
    //let sudoku = newGrid(CONSTANT.GRID_SIZE);
    let sudoku = new Array(9).fill(0).map(_ => new Array(9).fill(0));
    let check = sudokuCreate(sudoku);
    if (check) {
        let question = removeCells(sudoku, level);
        return {
            original: sudoku,
            question: question
        }
    }
    return undefined;
}
//雙向檢查是否合乎規則
function checkSudoku(board) {
    let b1 = Array(board.length).fill(0).map((e, i) => { return [...board[i]] });
    let b2 = Array(board.length).fill(0).map((e, i) => { return [...board[i]] });
    dfs(b1, b1.length);
    redfs(b2, b2.length)
    return b1.join(',') == b2.join(',');
}
//順向填入1-9
function dfs(board, n) {
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            if (board[row][col] != 0) continue;
            for (let i = 1; i <= 9; i++) {
                if (isValid(board, row, col, n, i)) {
                    board[row][col] = i;
                    if (dfs(board, n)) return true;
                }
            }
            board[row][col] = 0;
            return false;
        }
    }
    return true;
}
//檢查是否重複
function isValid(board, row, col, n, c) {
    for (let i = 0; i < n; i++) {
        if (board[row][i] === c || board[i][col] === c) return false;
        if (board[~~(row / 3) * 3 + ~~(i / 3)][~~(col / 3) * 3 + ~~(i % 3)] == c) return false;
    }
    return true;
}
//逆向填入9-1
function redfs(board, n) {
    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            if (board[row][col] != 0) continue;
            for (let i = 9; i >= 1; i--) {
                if (isValid(board, row, col, n, i)) {
                    board[row][col] = i;
                    if (redfs(board, n)) return true;
                }
            }
            board[row][col] = 0;
            return false;
        }
    }
    return true;
}
//遊戲執行時檢查
const sudokuCheck = (grid) => {
    if (isFullGrid(grid)) {
        let row = sudokurowcheck(grid); console.log(row);
        let col = sudokucolcheck(grid); console.log(col);
        let box = sudokuboxcheck(grid); console.log(box);
        return row && col && box;
    } else {
        return false;
    }

}
const sudokurowcheck = (grid) => { for (let e of grid) { let set = new Set(e); if (set.size != 9) { return false; } } return true; }
const sudokucolcheck = (grid) => {
    for (let i = 0; i < grid[0].length; i++) {
        let set = new Set();
        for (let j = 0; j < grid.length; j++) { set.add(grid[j][i]); }
        if (set.size != 9) { console.log(set); return false; }
    }
    return true;
}
const sudokuboxcheck = (grid) => {
    let arr = [0, 3, 6];
    for (let row of arr) {
        for (let col of arr) {
            let set = new Set();
            for (let i = 0; i < 9; i++) { set.add(grid[~~(row / 3) * 3 + ~~(i / 3)][~~(col / 3) * 3 + ~~(i % 3)]) }
            if (set.size != 9) { return false; }
        }
    }
    return true;
}
/*
const sudokuCheck = (grid) => {
    let unassigned_pos = {
        row: -1,
        col: -1
    }

    if (!findUnassignedPos(grid, unassigned_pos)) return true;

    grid.forEach((row, i) => {
        row.forEach((num, j) => {
            if (isSafe(grid, i, j, num)) {
                if (isFullGrid(grid)) {
                    return true;
                } else {
                    if (sudokuCreate(grid)) {
                        return true;
                    }
                }
            }
        })
    })

    return isFullGrid(grid);
}
*/
