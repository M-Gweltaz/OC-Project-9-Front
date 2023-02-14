/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import router from '../app/Router.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import Bills from '../containers/Bills.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { mockStore } from '../__mocks__/store';

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', async () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId('icon-window'));
			const windowIcon = screen.getByTestId('icon-window');
			expect(windowIcon.className).toBe('active-icon');
		});
		test('Then bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)

				.map((a) => a.innerHTML);
			const datesSorted = [...dates].sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);
			expect(dates).toEqual(datesSorted);
		});

		it('Should have the right title', async () => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByText(/Mes notes de frais/g));
			const billTitle = screen.getByText(/Mes notes de frais/g);
			expect(billTitle.textContent).toMatch(/Mes notes de frais/g);
		});

		describe('When i click on the new bill button', () => {
			it('Should render the newBill UI', () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				const billsInstance = new Bills({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				});

				const handleClickNewBill = jest.fn(() =>
					billsInstance.handleClickNewBill()
				);
				const buttonNewBill = screen.getByTestId('btn-new-bill');

				buttonNewBill.addEventListener('click', handleClickNewBill);
				userEvent.click(buttonNewBill);

				const newBillForm = screen.getByTestId('form-new-bill');
				expect(newBillForm).toBeTruthy();
			});
		});

		describe('When i click on the eye button', () => {
			it('Should render a modal', () => {
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				Object.defineProperty(window, 'localStorage', {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					'user',
					JSON.stringify({
						type: 'Employee',
					})
				);
				const billsInstance = new Bills({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				});
				document.body.innerHTML = BillsUI({ data: bills });

				$.fn.modal = jest.fn();

				const iconEye = screen.getAllByTestId('icon-eye');
				const handleClickIconEye = jest.fn((icon) =>
					billsInstance.handleClickIconEye(icon)
				);
				const modaleFile = document.getElementById('modaleFile');
				$.fn.modal = jest.fn(() => modaleFile.classList.add('show'));
				iconEye.forEach((icon) => {
					icon.addEventListener('click', handleClickIconEye(icon));
					userEvent.click(icon);
					expect(handleClickIconEye).toHaveBeenCalled();
				});
				expect(modaleFile.getAttribute('class')).toMatch(/show/gi);
			});
		});
	});
});

// TEST INTEGRATION
describe('Given I am connected as an employee', () => {
	describe('when i navigate to Bills', () => {
		beforeEach(() => {
			jest.spyOn(mockStore, 'bills');
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
					email: 'a@a',
				})
			);
			const root = document.createElement('div');
			root.setAttribute('id', 'root');
			document.body.appendChild(root);
			router();

			it('Should fetch the data from the API', async () => {
				onNavigate(ROUTES_PATH.Bills);

				const mockedBill = await waitFor(() => screen.getByText('encore'));
				const mockedBill1 = await waitFor(() => screen.getByText('test1'));
				const mockedBill2 = await waitFor(() => screen.getByText('test2'));

				expect([mockedBill, mockedBill1, mockedBill2]).toBeTruthy();

				describe('When an HTTP error occur', () => {
					describe('When an HTTP error 404 occur', async () => {
						mockStore.bills.mockImplementationOnce(() => {
							return {
								list: () => {
									return Promise.reject(new Error('Erreur 404'));
								},
							};
						});
						window.onNavigate(ROUTES_PATH.Bills);
						await new Promise(process.nextTick);
						const message = await screen.getByText(/Erreur 404/);
						expect(message).toBeTruthy();
					});

					describe('When an HTTP error 500 occur', async () => {
						mockStore.bills.mockImplementationOnce(() => {
							return {
								list: () => {
									return Promise.reject(new Error('Erreur 500'));
								},
							};
						});
						window.onNavigate(ROUTES_PATH.Bills);
						await new Promise(process.nextTick);
						const message = await screen.getByText(/Erreur 500/);
						expect(message).toBeTruthy();
					});
				});
			});
		});
	});
});
