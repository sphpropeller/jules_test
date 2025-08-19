document.addEventListener('DOMContentLoaded', () => {
    const memoForm = document.getElementById('memo-form');
    const memoContent = document.getElementById('memo-content');
    const memoList = document.getElementById('memo-list');

    // エラーメッセージを表示するヘルパー関数
    const displayError = (message) => {
        const li = document.createElement('li');
        li.textContent = message;
        li.style.color = 'red';
        memoList.prepend(li); // エラーをリストの先頭に表示
        setTimeout(() => li.remove(), 5000); // 5秒後に消す
    };

    // メモをサーバーから読み込んで表示する
    const fetchMemos = async () => {
        try {
            const response = await fetch('/api/memos');
            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            const memos = await response.json();
            memoList.innerHTML = ''; // リストを一旦クリア
            // メモを逆順（新しいものが上）に表示する
            memos.reverse().forEach(memo => {
                const li = document.createElement('li');
                li.textContent = memo;
                memoList.appendChild(li);
            });
        } catch (error) {
            console.error('メモの読み込みに失敗しました:', error);
            displayError('メモの読み込みに失敗しました。');
        }
    };

    // フォームの送信イベントを処理する
    memoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = memoContent.value.trim();
        if (!content) {
            alert('メモの内容を入力してください。');
            return;
        }

        try {
            const response = await fetch('/api/memos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ memo: content }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'サーバーでエラーが発生しました。');
            }

            const result = await response.json();
            if (result.success) {
                // 新しいメモをリストの先頭に追加
                const li = document.createElement('li');
                li.textContent = result.memo;
                memoList.prepend(li);
                memoContent.value = ''; // テキストエリアをクリア
            }
        } catch (error) {
            console.error('メモの保存中にエラー:', error);
            alert(`メモの保存に失敗しました: ${error.message}`);
        }
    });

    // ページ読み込み時にメモを初期表示する
    fetchMemos();
});
