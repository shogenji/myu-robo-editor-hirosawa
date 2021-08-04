let commandData = [
	['パワーオンスタート', 111, 1, 'プログラムの先頭に置くと電源オンとともにプログラムが始まる。'],
	['前進', 2, 2, '引数（0〜255）× 0.1秒だけ両輪を前転（前進）させる。'],
	['後退', 8, 2, '引数（0〜255）× 0.1秒だけ両輪を後転（後退）させる。'],
	['右回り', 10, 2, '引数（0〜255）× 0.1秒だけ左車輪を前転・右車輪を後転。'],
	['左回り', 11, 2, '引数（0〜255）× 0.1秒だけ右車輪を前転・左車輪を後転。'],
	['停止', 0, 2, '引数（0〜255）× 0.1秒だけ停止させる。'],
	['左前', 1, 2, '引数（0〜255）× 0.1秒だけ左車輪を前転させる。'],
	['左後', 7, 2, '引数（0〜255）× 0.1秒だけ左車輪を後転させる。'],
	['右前', 3, 2, '引数（0〜255）× 0.1秒だけ右車輪を前転させる。'],
	['右後', 9, 2, '引数（0〜255）× 0.1秒だけ右車輪を後転させる。'],
	['モーター左', 4, 2, '第3モーターを引数（0〜255）× 0.1秒だけ左回転させる。'],
	['モーター右', 6, 2, '第3モーターを引数（0〜255）× 0.1秒だけ右回転させる。'],
	['時間', 5, 2, '引数（0〜255）× 0.1秒だけ前の状態を続ける。'],
	['ブザー', 80, 2, '引数（0〜255）× 0.1秒だけブザーを鳴らす。'],
	['電子音', 105, 3, '第1引数（1〜255）× 0.1秒だけ第2引数:パルス幅（1〜255） の音を鳴らす。パルス幅が大きいほど音は低くなる。'],
	['リミットスイッチ', 112, 1, 'リミットスイッチが押されるまで以前の状態を続ける。'],
	['ブロックはじめ', 81, 2, '引数のブロック番号（1〜127）を宣言し「ブロックおわり」までの間にプログラムを書く。'],
	['ブロックおわり', 113, 1, 'ブロックの終わりを宣言する。'],
	['ブロック実行', 82, 2, '引数のブロック番号（1〜127）を呼び出す。'],
	['ブロック繰り返し', 106, 3, '第1引数のブロック番号を第2引数の回数（0〜255）を繰り返す。回数が0の場合は無限に繰り返す。'],
	['ブロック脱出', 114, 1, 'ブロック内から強制的に抜け出す。'],
	['アンカー', 83, 2, '引数のアンカー番号（1〜127）を宣言。'],
	['ジャンプ', 84, 2, '引数のアンカー番号（1〜127）にジャンプ。'],
	['入力なしジャンプ', 109, 3, '第1引数のアンカー番号（1〜127）に第2引数の入力ポート（1〜4）が離れていたらにジャンプする。'],
	['入力ありジャンプ', 108, 3, '第1引数のアンカー番号（1〜127）に第2引数の入力ポート（1〜4）が接続されていたらにジャンプする。'],
];