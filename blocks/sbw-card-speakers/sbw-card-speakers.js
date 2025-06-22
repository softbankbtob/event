import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-card-speakers';
  const containerClass = `${baseClass}-list`;
  const itemWrapperClass = `${baseClass}-listItem`;
  const itemClass = `${baseClass}-item`;
  const itemInnerClass = `${itemClass}-inner`;
  const itemImageClass = `${itemClass}-image`;
  const itemBody1Class = `${itemClass}-body1`;
  const itemBody2Class = `${itemClass}-body2`;
  const itemListsClass = `${itemClass}-lists`;
  const itemTagsClass = `${itemClass}-tags`;

  // アイテムの数
  const blockLength = block.children.length;

  // 画像サイズの出しわけ設定
  const breakpoints = [
    { media: '(min-width: 1200px)', width: '2000' },
    { width: `${blockLength <= 1 ? '900' : '600'}` }
  ];

  // containerを作成（要素が1つのみの場合はdiv）
  const container = blockLength <= 1 ? document.createElement('div') : document.createElement('ul');
  container.className = containerClass;

  [...block.children].forEach((row) => {

    // 「link-all」クラスがあれば、全体をリンクエリアに変換／見出しタグがあれば、rowをsectionに変換
    const isHeading = row.querySelector('h2, h3, h4, h5, h6');
    const isLinkAll = block.classList.contains('link-all') && row.querySelector('a');
    // const hasTags = row.querySelector('a');
    const section = document.createElement(isLinkAll ? 'a' : isHeading ? 'section' : 'div');
    const sectionInner = document.createElement('div');
    section.className = itemClass;
    sectionInner.className = itemInnerClass;
    sectionInner.append(...row.childNodes);
    section.append(sectionInner);

    // 各子要素にクラスを追加
    [...sectionInner.children].forEach((child, index) => {
      switch (index) {
        case 0:
          child.className = itemImageClass;
          break;
        case 1:
          child.className = itemBody1Class;
          break;
        case 2:
          child.className = itemBody2Class;
          break;
        default:
          break;
      }
    });

    // 全体がリンクエリアの場合、hrefを設定し、もとの要素を削除
    if (isLinkAll) {
      const innerLink = sectionInner.querySelector('a');
      section.href = innerLink.href;
      section.classList.add('-link');
      innerLink.closest('div').remove();
    }

    // 要素が1つの場合は直接追加
    if (blockLength === 1) {
      container.append(section);
    } else {
      const li = document.createElement('li');
      li.className = itemWrapperClass;

      // アイテムをリストに追加
      li.append(section);
      container.append(li);
    }

    //通常リンクはリンク、太字になるとボタンに変更
    // デフォの設定は通常リンクでボタンになる

    // ボタンとリンクの処理
    const buttonLinks = sectionInner.querySelectorAll('.button-container');
    // ボタンコンテナが存在する場合、それらをbuttons-wrapperで囲む
    if (buttonLinks.length > 0) {
      // 最初のボタンコンテナの親要素を取得
      const parentElement = buttonLinks[0].parentElement;
      // buttons-wrapperを作成
      const buttonsWrapper = document.createElement('div');
      buttonsWrapper.className = 'buttons-wrapper';
      // 最初のボタンコンテナの位置を特定
      const firstButtonIndex = Array.from(parentElement.children).indexOf(buttonLinks[0]);
      // すべてのボタンコンテナを取得して配列に変換
      const buttonContainers = Array.from(buttonLinks);
      // ボタンコンテナをbuttons-wrapperに移動
      buttonContainers.forEach(container => {
        buttonsWrapper.appendChild(container);
      });
      // 元の位置にbuttons-wrapperを挿入
      parentElement.insertBefore(buttonsWrapper, parentElement.children[firstButtonIndex]);
    }





    // const buttonLinks = sectionInner.querySelectorAll('.button-container');
    // buttonLinks.forEach((buttonContainer) => {
    //   const link = buttonContainer.querySelector('a');
    //   if (!link) return;

    //   // strongタグがある場合は削除してボタンとして扱う
    //   const strong = buttonContainer.querySelector('strong');
    //   if (strong) {
    //     const newLink = strong.querySelector('a');
    //     if (newLink) {
    //       strong.replaceWith(newLink);
    //     }
    //   }
    // });

    // リストのclass付け
    // 通常のリスト

    // リストかつ斜体のもののulにitemTagsClassをつける
    const tagsList = sectionInner.querySelectorAll('ul');
    tagsList.forEach((ul) => {
      const hasEmTags = Array.from(ul.children).every(li => li.querySelector('em'));
      if (hasEmTags) {
        ul.className = itemTagsClass;
        // emタグを削除してテキストのみを残す
        ul.querySelectorAll('li em').forEach((em) => {
          const textContent = em.textContent;
          em.parentNode.textContent = textContent;
        });
      } else {
        ul.className = itemListsClass;
      }
    });

    const alignList = sectionInner.querySelectorAll('[data-align]');
    alignList.forEach((align) => {
      const alignData = align.getAttribute('data-align');
      if (alignData) align.style.textAlign = alignData;
    });

  });

  // pictureを最適化
  container.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, breakpoints));
  });

  // blockに追加
  block.innerHTML = '';
  block.append(container);
}
