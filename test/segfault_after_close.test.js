const sqlite3 = require('..');
const path = require('path');

describe('graceful DB closing', ()=>{
    it('library does not segfault when DB is queried after closing', ()=>{
        // This test tries to trigger a segfault that used to occur
        // when the DB was queried after it was closed. 
        // See issue https://github.com/mapbox/node-sqlite3/issues/1323.

        // Note that we do not have an error case here. It simply
        // tries to trigger the segfault for a fixed amount of time
        // and considers the test passed when no segfault is triggered.
        // If it is triggered, the segfault takes the whole test suite down.
        return new Promise((ok,fail)=>{
            let stop = false
            setTimeout(()=>{
                stop = true
            }, 20000)
            const interval = setInterval(() => {
                if (stop) {
                    clearInterval(interval)
                    ok()
                    return
                }
                const db = new sqlite3.Database(path.join(__dirname, 'test.db'))
                setTimeout(() => db.all('select * from foo limit 1;', ()=>{}), 1)
                db.close()
            }, 500)
        })

    })
})
