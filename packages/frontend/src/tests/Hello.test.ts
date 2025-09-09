import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Hello from './Hello.vue';

describe('Hello.vue', () => {
  it('renders props.msg', () => {
    const wrapper = mount(Hello, {
      props: { msg: 'Hello Vitest' },
    });
    expect(wrapper.text()).toBe('Hello Vitest');
  });
});
