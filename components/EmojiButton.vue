<script setup lang="ts">
import { useToggle, useTimeoutFn } from '@vueuse/core';
import { ref } from 'vue';

const props = defineProps<{ emoji: string }>();

const DELAY = 1500;
const copied = ref(false);

const [isShowing, setIsShowing] = useToggle(true);

const { start } = useTimeoutFn(() => setIsShowing(false), DELAY, { immediate: false });

const copyToClipboard = async (text: string) => {
  // Try modern Clipboard API first (requires HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand');
    }
  }

  // Fallback for HTTP: use execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const result = document.execCommand('copy');
    textarea.remove();
    return result;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

const onClick = async () => {
  const success = await copyToClipboard(props.emoji);
  if (success) {
    copied.value = true;
    setIsShowing(true);
    start();
    setTimeout(() => { copied.value = false; }, DELAY);
  }
};
</script>

<template>
  <UTooltip
    :text="copied ? 'Copied' : 'Copy'"
    :prevent="!isShowing"
    @mouseleave="setIsShowing(true)"
  >
    <div>
      <UButton variant="ghost" class="text-xl" square @click="onClick">
        {{ emoji }}
      </UButton>
    </div>
  </UTooltip>
</template>
