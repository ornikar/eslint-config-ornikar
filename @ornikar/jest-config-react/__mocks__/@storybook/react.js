/* eslint-env jest */

'use strict';

const React = require('react');
const { shallow } = require('enzyme');
const { shallowToJson } = require('enzyme-to-json');

const decorateStory = (storyFn, decorators) =>
  decorators.reduce(
    (decorated, decorator) => (context = {}) =>
      decorator(
        (p = {}) =>
          decorated(
            // MUTATION !
            Object.assign(
              context,
              p,
              {
                parameters: Object.assign(context.parameters || {}, p.parameters),
              },
              { options: Object.assign(context.options || {}, p.options) },
            ),
          ),
        context,
      ),
    storyFn,
  );

// Mocked version of `import { action } from '@storybook/react'`.
exports.action = (actionName) => jest.fn();

const shallowOptions = {
  disableLifecycleMethods: true,
};

const JestStoryWrapper = ({ children }) => children;
const jestWrapperDecorator = (storyFn) => React.createElement(JestStoryWrapper, {}, storyFn());

// Mocked version of: `import { storiesOf } from '@storybook/react'`
exports.storiesOf = (groupName) => {
  const localDecorators = [];
  const localParameters = {};

  // Mocked API to generate tests from & snapshot stories.
  const api = {
    add(storyName, story, storyParameters = {}) {
      const parameters = Object.assign({ name: storyName }, localParameters, storyParameters);
      const { jest } = parameters;
      const { componentToTest, ignore, ignoreDecorators } = jest || {};

      if (ignore) return api;

      describe(groupName, () => {
        it(storyName, () => {
          if ((localDecorators.length === 0 || ignoreDecorators) && !componentToTest) {
            expect(shallowToJson(shallow(story(parameters), shallowOptions))).toMatchSnapshot();
            return;
          }

          const wrapper = shallow(
            ignoreDecorators
              ? story(parameters)
              : decorateStory(story, componentToTest ? localDecorators : [jestWrapperDecorator, ...localDecorators])(
                  parameters,
                ),
            shallowOptions,
          );

          if (componentToTest) {
            const component = wrapper.find(componentToTest);
            component.forEach((child) => {
              expect(shallowToJson(child.dive())).toMatchSnapshot();
            });
          } else {
            expect(
              shallowToJson(
                wrapper
                  .find(JestStoryWrapper)
                  .children()
                  .shallow(),
              ),
            ).toMatchSnapshot();
          }
        });
      });

      return api;
    },

    addParameters(parameters) {
      Object.assign(localParameters, parameters);
      return api;
    },

    // Any `storybook-addon-*` packages may require noop-ing them:
    addDecorator(decorator) {
      localDecorators.push(decorator);
      return api;
    },
  };

  return api;
};
