import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createPurchaseFormSchema,
  createPurchaseTransactionSchema,
} from './purchaseSchema';
import { TransactionTypeEnum } from '@/modules/transactions/types';
import { PURCHASE_TRANSACTION_TEXT } from '../utils/purchaseUtils';

describe('Purchase & Sale Schema: TT Remittance vs CARD Stock Validation', () => {
  const itemSchema = createPurchaseTransactionSchema(TransactionTypeEnum.SALE);

  it('validates TT sale row with dealCoverId and EMPTY cardId without errors (QA bug regression)', async () => {
    const validTtRow = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      currencyCode: 'USD',
      productId: '88888888-8888-8888-8888-888888888888',
      productCode: 'TT',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      dealCoverId: '22222222-2222-2222-2222-222222222222',
      dealCoverSnapshot: { feAmount: '50000.00' },
      quantity: '50000.00',
      feAmount: '50000.00',
      rate: '88.50',
      cardId: '', // TT must NOT require cardId
      isReload: false,
      autoSurrender: true,
    };

    const validated = await itemSchema.validate(validTtRow);
    assert.ok(validated);
    assert.equal(validated.productCode, 'TT');
    assert.equal(validated.dealCoverId, '22222222-2222-2222-2222-222222222222');
    assert.equal(validated.cardId, '');
  });

  it('rejects TT sale row when dealCoverId is missing', async () => {
    const rowWithoutDeal = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '88888888-8888-8888-8888-888888888888',
      productCode: 'TT',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      dealCoverId: '', // Missing
      quantity: '50000.00',
      feAmount: '50000.00',
      rate: '88.50',
      cardId: '',
    };

    await assert.rejects(
      async () => itemSchema.validate(rowWithoutDeal),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('Deal cover is required for TT products'));
        return true;
      }
    );
  });

  it('rejects TT sale row when issuer is missing', async () => {
    const rowWithoutIssuer = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '88888888-8888-8888-8888-888888888888',
      productCode: 'TT',
      hasIssuerLinks: true,
      issuerPartyProfileId: '', // Missing
      dealCoverId: '22222222-2222-2222-2222-222222222222',
      quantity: '50000.00',
      feAmount: '50000.00',
      rate: '88.50',
      cardId: '',
    };

    await assert.rejects(
      async () => itemSchema.validate(rowWithoutIssuer),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('Issuer is required'));
        return true;
      }
    );
  });

  it('rejects TT sale row when FE quantity does not match deal cover snapshot amount', async () => {
    const rowMismatchedFe = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '88888888-8888-8888-8888-888888888888',
      productCode: 'TT',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      dealCoverId: '22222222-2222-2222-2222-222222222222',
      dealCoverSnapshot: { feAmount: '50000.00' },
      quantity: '10000.00', // Mismatch: 10,000 vs Deal 50,000
      feAmount: '10000.00',
      rate: '88.50',
      cardId: '',
    };

    await assert.rejects(
      async () => itemSchema.validate(rowMismatchedFe),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(
          error.message.includes(PURCHASE_TRANSACTION_TEXT.feAmountMustMatchDeal) ||
          error.message.toLowerCase().includes('match the deal fe amount')
        );
        return true;
      }
    );
  });

  it('strictly requires cardId for Single Currency Card (CC) items (ensuring card validation was not degraded)', async () => {
    const ccWithoutCard = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '77777777-7777-7777-7777-777777777777',
      productCode: 'CC',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      quantity: '1000.00',
      feAmount: '1000.00',
      rate: '88.50',
      cardId: '', // Missing on CARD item!
    };

    await assert.rejects(
      async () => itemSchema.validate(ccWithoutCard),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('CARD selection is required'));
        return true;
      }
    );
  });

  it('strictly requires cardId for Multi Currency Card (CM) items', async () => {
    const cmWithoutCard = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '66666666-6666-6666-6666-666666666666',
      productCode: 'CM',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      quantity: '1000.00',
      feAmount: '1000.00',
      rate: '88.50',
      cardId: '', // Missing on CARD item!
    };

    await assert.rejects(
      async () => itemSchema.validate(cmWithoutCard),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('CARD selection is required'));
        return true;
      }
    );
  });

  it('validates full Sale form with TT remittance, travel details, and empty cardId cleanly', async () => {
    const formSchema = createPurchaseFormSchema(TransactionTypeEnum.SALE, { allowNullManualBook: true });

    const fullTtForm = {
      branchId: '33333333-3333-3333-3333-333333333333',
      counterId: '44444444-4444-4444-4444-444444444444',
      transactionDate: '2026-11-18',
      partyProfileId: '55555555-5555-5555-5555-555555555555',
      travelCountryId: 'GB',
      passenger: {
        passengerType: 'INDIVIDUAL',
        firstName: 'Ramesh',
        lastName: 'Sharma',
        nationalityType: 'INDIAN',
        panNumber: 'ABCDE1234F',
        passportNumber: 'Z1234567',
      },
      passengerTravel: {
        travelCountry: 'GB',
      },
      ttRemittance: {
        remitterName: 'Ramesh Sharma',
        beneficiaryName: 'Oxford University',
        bankName: 'Barclays Bank London',
        swiftCode: 'BARCGB22',
        accountNumber: 'GB29BARC20201531234567',
        chargeBearer: 'OUR',
        fbBearerOptionId: 'opt-our-123',
      },
      transactions: [
        {
          currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
          currencyCode: 'USD',
          productId: '88888888-8888-8888-8888-888888888888',
          productCode: 'TT',
          hasIssuerLinks: true,
          issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
          dealCoverId: '22222222-2222-2222-2222-222222222222',
          dealCoverSnapshot: { feAmount: '50000.00' },
          quantity: '50000.00',
          feAmount: '50000.00',
          rate: '88.50',
          cardId: '',
          isReload: false,
          autoSurrender: true,
        },
      ],
      payments: [
        {
          paymentMethod: 'BANK_TRANSFER',
          accountId: '99999999-9999-9999-9999-999999999999',
          amount: '4425000.00',
          referenceDate: '2026-11-18',
        },
      ],
      additionalCharges: [],
    };

    const validated = await formSchema.validate(fullTtForm);
    assert.ok(validated);
    assert.equal(validated.transactions[0].cardId, '');
  });

  it('validates TP purchase row with issuer, quantity, autoSurrender: true, and EMPTY cardId cleanly', async () => {
    const itemSchema = createPurchaseTransactionSchema(TransactionTypeEnum.PURCHASE);

    const validTpRow = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '55555555-5555-5555-5555-555555555555',
      productCode: 'TP',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      quantity: '1000.00',
      feAmount: '1000.00',
      rate: '87.00',
      cardId: '', // Empty: paper cheques do not use plastic card IDs
      autoSurrender: true,
    };

    const validated = await itemSchema.validate(validTpRow);
    assert.ok(validated);
    assert.equal(validated.productCode, 'TP');
    assert.equal(validated.cardId, '');
    assert.equal(validated.autoSurrender, true);
  });

  it('rejects TP purchase row when issuer is missing', async () => {
    const itemSchema = createPurchaseTransactionSchema(TransactionTypeEnum.PURCHASE);

    const tpWithoutIssuer = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '55555555-5555-5555-5555-555555555555',
      productCode: 'TP',
      hasIssuerLinks: true,
      issuerPartyProfileId: '', // Missing
      quantity: '1000.00',
      feAmount: '1000.00',
      rate: '87.00',
      cardId: '',
      autoSurrender: true,
    };

    await assert.rejects(
      async () => itemSchema.validate(tpWithoutIssuer),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('Issuer is required'));
        return true;
      }
    );
  });

  it('rejects TP purchase row when FE amount is empty or non-positive', async () => {
    const itemSchema = createPurchaseTransactionSchema(TransactionTypeEnum.PURCHASE);

    const tpZeroAmount = {
      currencyId: '44567961-06a4-47b2-8c11-9a74c2eef8e0',
      productId: '55555555-5555-5555-5555-555555555555',
      productCode: 'TP',
      hasIssuerLinks: true,
      issuerPartyProfileId: '11111111-1111-1111-1111-111111111111',
      quantity: '0.00',
      feAmount: '0.00',
      rate: '87.00',
      cardId: '',
      autoSurrender: true,
    };

    await assert.rejects(
      async () => itemSchema.validate(tpZeroAmount),
      (err: unknown) => {
        const error = err as Error;
        assert.ok(error.message.includes('FE Amount must be greater than 0'));
        return true;
      }
    );
  });
});
