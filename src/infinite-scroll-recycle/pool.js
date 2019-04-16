

class Pool {
    pool;

    constructor() {
        this.pool = [];
    }

    getPool() {
        return this.pool;
    }

    setPool(itemsArray) {
        this.pool = itemsArray;
    }

    
    // @param top: is boolean to determine whether to pop off top or bottom
    // @param size: number of elements to pop
    pop(size, top) {
        let items = [];
        if (top) {
            items = this.pool.slice(0, size);
            this.pool = this.pool.slice(size);
        } else {
            items = this.pool.slice(this.pool.length - size);
            this.pool = this.pool.slice(0, this.pool.length - size)
        }
        return items;
    }

    // @param el: should be list of elements to add to pool
    // @param top: is boolean to determine whether to pop off top or bottom
    push(el, top) {
        if (top) {
            this.pool = el.concat(this.pool);
        } else {
            this.pool = this.pool.concat(el);
        }
    }
}

let instance = new Pool();
export default instance;