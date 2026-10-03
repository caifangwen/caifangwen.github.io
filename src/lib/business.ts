import { businessNavigation, type BusinessTopic } from '../data/business-navigation';
import { entries, type Entry } from './content';

export function flattenTopics(nodes: BusinessTopic[]): BusinessTopic[] {
  return nodes.flatMap(node => [node, ...flattenTopics(node.children)]);
}
export const businessTopics = flattenTopics(businessNavigation);
export function getTopicEntries(topic: BusinessTopic, content: Entry[] = entries): Entry[] {
  const terms = new Set(flattenTopics([topic]).map(item => item.term.toLocaleLowerCase()));
  return content.filter(entry => [...entry.categories, ...entry.tags].some(term => terms.has(term.trim().toLocaleLowerCase())));
}
export const getTopic = (path: string) => businessTopics.find(topic => topic.path === path)!;
