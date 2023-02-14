/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { mockStore } from '../__mocks__/store.js';
import router from '../app/Router.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { bills } from '../fixtures/bills.js';

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		it('Should render a form-new-bill', async () => {
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
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId('form-new-bill'));

			const newBillForm = screen.getByTestId('form-new-bill');
			expect(newBillForm).toBeTruthy();
		});

		it('Should render a vertical navbar', async () => {
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
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId('form-new-bill'));

			const verticalNavBarIcon1 = screen.getByTestId('icon-window');
			const verticalNavBarIcon2 = screen.getByTestId('icon-mail');
			expect([verticalNavBarIcon1, verticalNavBarIcon2]).toBeTruthy();
		});

		describe('When i give a wrong file format', () => {
			it('should show the file name and the input border in red', async () => {
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
				window.onNavigate(ROUTES_PATH.NewBill);
				await waitFor(() => screen.getByTestId('form-new-bill'));

				const fileInput = screen.getByTestId('file');

				fireEvent.change(fileInput, {
					target: {
						files: [new File(['test.docx'], 'test.docx')],
					},
				});
				await new Promise(process.nextTick);

				expect(fileInput.className).toContain('border-danger');
				expect(fileInput.className).toContain('text-danger');
			});

			it('the submit button should be disabled', async () => {
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
				window.onNavigate(ROUTES_PATH.NewBill);
				await waitFor(() => screen.getByTestId('form-new-bill'));

				const fileInput = screen.getByTestId('file');
				const submitBtn = screen.getByText(/^Envoyer$/gi);

				fireEvent.change(fileInput, {
					target: {
						files: [new File(['test.docx'], 'test.docx')],
					},
				});
				await new Promise(process.nextTick);
				console.log(submitBtn.attributes);

				expect(submitBtn).toBeDisabled();
			});
		});

		describe('When i submit the form-new-bill', () => {
			it('Should handle the submit by saving the data and rendering the bill page', async () => {
				document.body.innerHTML = NewBillUI();

				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname, data: bills });
				};
				Object.defineProperty(window, 'localStorage', {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					'user',
					JSON.stringify({
						email: 'a@a',
					})
				);
				const newBill = new NewBill({
					document,
					onNavigate: onNavigate,
					store: null,
					localStorage: window.localStorage,
				});

				newBill.fileName = 'test';

				const newBillInstance = new NewBill({
					document,
					onNavigate,
					store: null,
					localStorage: window.localStorage,
				});

				const newBillForm = screen.getByTestId('form-new-bill');
				const handleSubmit = jest.fn((e) => newBillInstance.handleSubmit(e));
				newBillForm.addEventListener('submit', handleSubmit);
				fireEvent.submit(newBillForm);

				expect(handleSubmit).toHaveBeenCalled();

				const mockedBill = await waitFor(() => screen.getByText('test1'));
				expect(mockedBill).toBeTruthy();
			});
		});
	});
});
