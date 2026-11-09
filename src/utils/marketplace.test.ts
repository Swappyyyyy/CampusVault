import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCollegeEmail,
  extractStudentName,
  filterMarketplaceItems,
  formatPrice,
  updateItemStatus,
  INITIAL_ITEMS,
  MarketplaceItem,
} from './marketplace';

test('validateCollegeEmail accepts valid @college.edu.in emails', () => {
  const result = validateCollegeEmail('rohan.deshmukh@college.edu.in');
  assert.equal(result.isValid, true);
  assert.equal(result.error, undefined);
});

test('validateCollegeEmail accepts other .edu.in institutional domains', () => {
  const result = validateCollegeEmail('priya.k@iitd.edu.in');
  assert.equal(result.isValid, true);
});

test('validateCollegeEmail rejects standard gmail and yahoo domains with quirky student error', () => {
  const gmailResult = validateCollegeEmail('student123@gmail.com');
  assert.equal(gmailResult.isValid, false);
  assert.match(gmailResult.error || '', /Access restricted to verified college student IDs only/);

  const yahooResult = validateCollegeEmail('random@yahoo.com');
  assert.equal(yahooResult.isValid, false);
});

test('validateCollegeEmail rejects empty inputs gracefully', () => {
  const emptyResult = validateCollegeEmail('   ');
  assert.equal(emptyResult.isValid, false);
});

test('extractStudentName formats dot-separated usernames nicely', () => {
  assert.equal(extractStudentName('rahul.verma@college.edu.in'), 'Rahul Verma');
  assert.equal(extractStudentName('ananya@college.edu.in'), 'Ananya');
});

test('filterMarketplaceItems filters dynamically by query in title or description', () => {
  const matches = filterMarketplaceItems(INITIAL_ITEMS, 'drafter', 'All');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, 'item-1');

  const cseMatches = filterMarketplaceItems(INITIAL_ITEMS, 'DSA', 'All');
  assert.equal(cseMatches.length >= 1, true);
  assert.equal(cseMatches[0].category, 'Books');
});

test('filterMarketplaceItems filters by category pill accurately', () => {
  const bookItems = filterMarketplaceItems(INITIAL_ITEMS, '', 'Books');
  assert.ok(bookItems.length > 0);
  assert.ok(bookItems.every(i => i.category === 'Books'));

  const labItems = filterMarketplaceItems(INITIAL_ITEMS, '', 'Lab Gear');
  assert.ok(labItems.length > 0);
  assert.ok(labItems.every(i => i.category === 'Lab Gear'));
});

test('filterMarketplaceItems isolates Free items correctly', () => {
  const freeItems = filterMarketplaceItems(INITIAL_ITEMS, '', 'Free');
  assert.ok(freeItems.length > 0);
  assert.ok(freeItems.every(i => i.price === 'Free'));
});

test('formatPrice renders Free or Rupee values', () => {
  assert.equal(formatPrice('Free'), 'Free');
  assert.equal(formatPrice(0), 'Free');
  assert.equal(formatPrice(350), '₹350');
});

test('updateItemStatus updates status immutably', () => {
  const updated = updateItemStatus(INITIAL_ITEMS, 'item-1', 'reserved');
  const target = updated.find((i: MarketplaceItem) => i.id === 'item-1');
  assert.equal(target?.status, 'reserved');

  const sold = updateItemStatus(updated, 'item-1', 'sold');
  assert.equal(sold.find((i: MarketplaceItem) => i.id === 'item-1')?.status, 'sold');

  // original items not mutated
  assert.equal(INITIAL_ITEMS.find((i: MarketplaceItem) => i.id === 'item-1')?.status, 'available');
});

test('filterIsoRequests filters by search keyword and category correctly', async () => {
  const { filterIsoRequests, INITIAL_ISO_REQUESTS } = await import('./marketplace');
  const results = filterIsoRequests(INITIAL_ISO_REQUESTS, 'physics', 'All');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'iso-1');

  const bookResults = filterIsoRequests(INITIAL_ISO_REQUESTS, '', 'Books');
  assert.ok(bookResults.length >= 2);
  assert.ok(bookResults.every(r => r.category === 'Books'));

  const emptyResults = filterIsoRequests(INITIAL_ISO_REQUESTS, 'nonexistentxyz99', 'All');
  assert.equal(emptyResults.length, 0);
});

test('getSimulatedSellerReply responds contextually to questions', async () => {
  const { getSimulatedSellerReply, INITIAL_ITEMS } = await import('./marketplace');
  const item = INITIAL_ITEMS[0]; // Drafter

  const availReply = getSimulatedSellerReply(item, 'Is this still available?');
  assert.match(availReply, /available/i);

  const meetReply = getSimulatedSellerReply(item, 'Can we meet today at 4?');
  assert.match(meetReply, /meet/i);
});

test('deleteMarketplaceItem and reportAndHideItem remove item by id', async () => {
  const { deleteMarketplaceItem, reportAndHideItem, INITIAL_ITEMS } = await import('./marketplace');
  const filtered = deleteMarketplaceItem(INITIAL_ITEMS, 'item-1');
  assert.equal(filtered.some(i => i.id === 'item-1'), false);
  assert.equal(filtered.length, INITIAL_ITEMS.length - 1);

  const reported = reportAndHideItem(INITIAL_ITEMS, 'item-2');
  assert.equal(reported.some(i => i.id === 'item-2'), false);
});

test('getUserMarketplaceItems and getUserIsoRequests filter by user email correctly', async () => {
  const { getUserMarketplaceItems, getUserIsoRequests, INITIAL_ITEMS, INITIAL_ISO_REQUESTS } = await import('./marketplace');
  const kabirItems = getUserMarketplaceItems(INITIAL_ITEMS, 'kabir.m@college.edu.in');
  assert.equal(kabirItems.length, 1);
  assert.equal(kabirItems[0].id, 'item-3');

  const emptyItems = getUserMarketplaceItems(INITIAL_ITEMS, 'unknown.user@college.edu.in');
  assert.equal(emptyItems.length, 0);

  const aaravRequests = getUserIsoRequests(INITIAL_ISO_REQUESTS, 'aarav.s@college.edu.in');
  assert.equal(aaravRequests.length, 1);
  assert.equal(aaravRequests[0].id, 'iso-1');
});



