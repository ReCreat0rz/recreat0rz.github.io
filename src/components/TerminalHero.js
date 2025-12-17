import styles from './TerminalHero.module.css';

const TerminalHero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.terminal}>
                <div className={styles.terminalHeader}>
                    <div className={`${styles.circle} ${styles.red}`}></div>
                    <div className={`${styles.circle} ${styles.yellow}`}></div>
                    <div className={`${styles.circle} ${styles.green}`}></div>
                </div>
                <div className={styles.terminalBody}>



                    <div className={styles.line}>
                        <span className={styles.prompt}>root@recreat0rz:~#</span>
                        <span className={styles.command}>cat quote.txt</span>
                    </div>
                    <div className={styles.output}>
                        {`
"I have not failed. I've just found 10,000 ways that won't work." - Thomas Edison`}
                    </div>
                    <br />

                    <div className={styles.line}>
                        <span className={styles.prompt}>root@recreat0rz:~#</span>
                        <span className={styles.command}>ls -la /skills/</span>
                    </div>
                    <div className={styles.output}>
                        <div className={styles.fileList}>
                            <div style={{ gridColumn: '1 / -1' }}>total 42</div>

                            {/* Row 1 */}
                            <div className={styles.fileRow}>
                                <span className={styles.directory}>drwxr-xr-x</span><span>2</span><span>recreat0rz</span><span>recreat0rz</span><span>4096</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.directory}>.</span>
                            </div>
                            {/* Row 2 */}
                            <div className={styles.fileRow}>
                                <span className={styles.directory}>drwxr-xr-x</span><span>10</span><span>recreat0rz</span><span>recreat0rz</span><span>4096</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.directory}>..</span>
                            </div>
                            {/* Row 3 */}
                            <div className={styles.fileRow}>
                                <span className={styles.executable}>-rwxr-xr-x</span><span>1</span><span>recreat0rz</span><span>recreat0rz</span><span>8192</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.executable}>blockchain.cairo</span>
                            </div>
                            {/* Row 4 */}
                            <div className={styles.fileRow}>
                                <span className={styles.executable}>-rwxr-xr-x</span><span>1</span><span>recreat0rz</span><span>recreat0rz</span><span>8192</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.executable}>blockchain.sol</span>
                            </div>
                            {/* Row 5 */}
                            <div className={styles.fileRow}>
                                <span className={styles.executable}>-rwxr-xr-x</span><span>1</span><span>recreat0rz</span><span>recreat0rz</span><span>6144</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.executable}>game.exe</span>
                            </div>
                            {/* Row 6 */}
                            <div className={styles.fileRow}>
                                <span className={styles.executable}>-rwxr-xr-x</span><span>1</span><span>recreat0rz</span><span>recreat0rz</span><span>5120</span><span>Dec</span><span>10</span><span>22:04</span><span className={styles.executable}>iOS.swift</span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
};

export default TerminalHero;
