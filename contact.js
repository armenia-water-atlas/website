'use strict';

const contactForm = document.getElementById('contact-form');
const contactFiles = document.getElementById('contact-files');
const contactStatus = document.getElementById('contact-status');
const contactShare = document.getElementById('share-message');
const contactTopic = document.getElementById('contact-topic');
const requestedTopic = new URLSearchParams(location.search).get('topic');
if (Array.from(contactTopic.options).some(option => option.value === requestedTopic)) {
  contactTopic.value = requestedTopic;
}

function preparedContactMessage() {
  const value = id => document.getElementById(id).value.trim();
  const topic = contactTopic.options[contactTopic.selectedIndex].textContent;
  const lines = ['Հայաստանի ջրային ատլաս', `Թեմա՝ ${topic}`];
  if (value('contact-object')) lines.push(`Օբյեկտ՝ ${value('contact-object')}`);
  if (value('contact-name')) lines.push(`Անուն՝ ${value('contact-name')}`);
  if (value('contact-email')) lines.push(`Պատասխանի հասցե՝ ${value('contact-email')}`);
  lines.push('', value('contact-message'));
  return { title: `Հայաստանի ջրային ատլաս․ ${topic}`, text: lines.join('\n') };
}

function validContactMessage() {
  const message = document.getElementById('contact-message');
  message.setCustomValidity(message.value.trim() ? '' : 'Խնդրում ենք գրել հաղորդագրությունը։');
  return contactForm.reportValidity();
}
document.getElementById('contact-message').addEventListener('input', event => event.target.setCustomValidity(''));

contactFiles.addEventListener('change', () => {
  const list = document.getElementById('file-list');
  list.replaceChildren();
  for (const file of contactFiles.files) {
    const row = document.createElement('li');
    row.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} ՄԲ)`;
    list.append(row);
  }
  contactStatus.textContent = contactFiles.files.length
    ? 'Ֆայլերը ընտրված են։ Դրանք դեռ չեն ուղարկվել։' : '';
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!validContactMessage()) return;
  const message = preparedContactMessage();
  contactStatus.textContent = 'Ավարտեք ուղարկումը էլ․ փոստի հավելվածում։ Ընտրված ֆայլերը կցեք այնտեղ։';
  location.href = `mailto:kr108043@yahoo.com?subject=${encodeURIComponent(message.title)}&body=${encodeURIComponent(message.text)}`;
});

document.getElementById('send-whatsapp').addEventListener('click', () => {
  if (!validContactMessage()) return;
  const message = preparedContactMessage();
  window.open(`https://wa.me/37491900915?text=${encodeURIComponent(message.text)}`, '_blank', 'noopener,noreferrer');
  contactStatus.textContent = 'Ավարտեք ուղարկումը WhatsApp-ում։ Ընտրված ֆայլերը կցեք զրույցին։';
});

contactShare.addEventListener('click', async () => {
  if (!validContactMessage()) return;
  const data = preparedContactMessage();
  const files = Array.from(contactFiles.files);
  if (!navigator.share) {
    contactStatus.textContent = 'Այս դիտարկիչը չի աջակցում «Կիսվել» հնարավորությանը։ Օգտվեք էլ․ փոստից կամ WhatsApp-ից և ֆայլերը կցեք այնտեղ։';
    return;
  }
  if (files.length) {
    data.files = files;
    if (!navigator.canShare || !navigator.canShare(data)) {
      contactStatus.textContent = 'Այս սարքով ընտրված ֆայլերի փոխանցումը չի աջակցվում։ Օգտվեք էլ․ փոստից կամ WhatsApp-ից և ֆայլերը կցեք այնտեղ։';
      return;
    }
  }
  contactShare.disabled = true;
  try {
    await navigator.share(data);
    contactStatus.textContent = 'Հաղորդագրությունը փոխանցվել է ընտրված հավելվածին։ Ստուգեք հասցեատիրոջը և ուղարկումը հավելվածում։';
  } catch (error) {
    contactStatus.textContent = error.name === 'AbortError'
      ? 'Կիսվելը չեղարկվել է։ Հաղորդագրությունն ու ընտրված ֆայլերը պահպանվել են այս էջում։'
      : 'Չհաջողվեց բացել «Կիսվել» պատուհանը։ Օգտվեք էլ․ փոստից կամ WhatsApp-ից։';
  } finally {
    contactShare.disabled = false;
  }
});

document.getElementById('copy-message').addEventListener('click', async () => {
  if (!validContactMessage()) return;
  try {
    await navigator.clipboard.writeText(preparedContactMessage().text);
    contactStatus.textContent = 'Տեքստը պատճենված է։ Տեղադրեք այն նամակում կամ զրույցում։ Ֆայլերը կցեք առանձին։';
  } catch (error) {
    contactStatus.textContent = 'Դիտարկիչը չի թույլատրել պատճենել տեքստը։ Կարող եք ընտրել և պատճենել հաղորդագրությունն ինքնուրույն։';
  }
});
