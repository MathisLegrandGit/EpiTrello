<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow hover:bg-[hsl(var(--color-primary))]/90',
        destructive: 'bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))] shadow-sm hover:bg-[hsl(var(--color-destructive))]/90',
        outline: 'border border-[hsl(var(--color-input))] bg-[hsl(var(--color-background))] shadow-sm hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]',
        secondary: 'bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))] shadow-sm hover:bg-[hsl(var(--color-secondary))]/80',
        ghost: 'hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]',
        link: 'text-[hsl(var(--color-primary))] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonVariants = VariantProps<typeof buttonVariants>

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  as?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class))
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>
