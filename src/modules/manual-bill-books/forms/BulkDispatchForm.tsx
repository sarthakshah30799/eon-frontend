import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Form,
    FormFieldInput,
    FormFieldSelect,
    FormFieldTextarea,
    FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { manualBillBookApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import type { Resolver } from 'react-hook-form';
import {
    useCreateManualBillBook,
    useListManualBillBookManagers,
} from '../hooks';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import type { IBulkDispatchFormValues } from '../types';

const bulkDispatchSchema = yup.object().shape({
    dispatchDate: yup.string().required('Date is required'),
    branchId: yup.string().required('Branch is required'),
    transactionType: yup.string().required('Transaction Type is required'),
    bookNoFrom: yup
        .number()
        .typeError('Must be a number')
        .integer()
        .positive()
        .required('Book No. From is required'),
    bookNoTo: yup
        .number()
        .typeError('Must be a number')
        .integer()
        .positive()
        .min(yup.ref('bookNoFrom'), 'Book No. To must be >= Book No. From')
        .required('Book No. To is required'),
    vouchersPerBook: yup
        .number()
        .typeError('Must be a number')
        .integer()
        .positive()
        .min(1, 'Must be at least 1')
        .required('No Of Voucher Per Book is required'),
    mvNoFrom: yup
        .number()
        .typeError('Must be a number')
        .integer()
        .positive()
        .required('MV No. From is required'),
    mvNoTo: yup.string(),
    assignedTo: yup.string().required('Assigned To is required'),
    remarks: yup.string().optional(),
});

interface BulkDispatchFormProps {
    onSuccess: () => void;
}

export const BulkDispatchForm = ({ onSuccess }: BulkDispatchFormProps) => {
    const navigate = useNavigate();
    const { user, activeBranchId } = useAuth();
    const isAdmin = user?.isAdmin === true;
    const { submitManualBillBook } = useCreateManualBillBook();
    const form = useFormContext<IBulkDispatchFormValues>();
    const branchId = useWatch({ name: 'branchId', control: form.control });
    const dispatchDate = useWatch({
        name: 'dispatchDate',
        control: form.control,
    });
    const bookNoFrom = useWatch({ name: 'bookNoFrom', control: form.control });
    const bookNoTo = useWatch({ name: 'bookNoTo', control: form.control });
    const vouchersPerBook = useWatch({
        name: 'vouchersPerBook',
        control: form.control,
    });
    const mvNoFrom = useWatch({ name: 'mvNoFrom', control: form.control });

    useEffect(() => {
        const fetchNextNumber = async () => {
            if (branchId && dispatchDate) {
                try {
                    const res = await manualBillBookApi.getNextNumber(
                        branchId,
                        dispatchDate
                    );
                    form.setValue('no', res.nextNumber);
                } catch (err) {
                    console.error('Failed to fetch next number', err);
                    form.setValue('no', '');
                }
            } else {
                form.setValue('no', '');
            }
        };
        fetchNextNumber();
    }, [branchId, dispatchDate, form]);

    useEffect(() => {
        const fromBook = parseInt(String(bookNoFrom), 10);
        const toBook = parseInt(String(bookNoTo), 10);
        const vpb = parseInt(String(vouchersPerBook), 10);
        const fromMv = parseInt(String(mvNoFrom), 10);

        if (!isNaN(fromBook) && !isNaN(toBook) && !isNaN(vpb) && !isNaN(fromMv)) {
            const numBooks = toBook - fromBook + 1;
            if (numBooks > 0) {
                const calculatedTo = fromMv + numBooks * vpb - 1;
                form.setValue('mvNoTo', String(calculatedTo));
            } else {
                form.setValue('mvNoTo', '');
            }
        } else {
            form.setValue('mvNoTo', '');
        }
    }, [bookNoFrom, bookNoTo, vouchersPerBook, mvNoFrom, form]);

    // Reset Assigned To when Branch changes
    useEffect(() => {
        form.setValue('assignedTo', '');
    }, [branchId, form]);

    const isHoStaff = !!user?.isHoStaff;
    const { data: branches = [] } = useListBranchProfiles({
        activeOnly: true,
    });
    const { data: branchManagers = [] } = useListManualBillBookManagers(branchId);
    const loadBranches = async () => ({
        options: branches.map(branch => ({
            value: branch.id,
            label: `${branch.code} - ${branch.name}`,
        })),
        hasMore: false,
    });
    const loadAssignedTo = async () => ({
        options: branchManagers.map(manager => ({
            value: manager.id,
            label: manager.name,
        })),
        hasMore: false,
    });
    const onCancel = () => {
        navigate('/manual-bill-books');
    };

    const handleSubmit = async (values: IBulkDispatchFormValues) => {
        await submitManualBillBook(values);
        onSuccess();
    };

    const defaultValues = {
        dispatchDate: new Date().toISOString().slice(0, 10),
        no: '',
        branchId: isAdmin ? '' : activeBranchId || '',
        transactionType: '',
        bookNoFrom: '',
        bookNoTo: '',
        vouchersPerBook: 50,
        mvNoFrom: '',
        mvNoTo: '',
        assignedTo: '',
        remarks: '',
    };

    return (
        <Form
            id="bulk-dispatch-form"
            onSubmit={handleSubmit}
            resolver={
                yupResolver(bulkDispatchSchema) as Resolver<IBulkDispatchFormValues>
            }
            defaultValues={defaultValues}
            mode="all"
            footer={{
                submitLabel: 'Create',
                onBackClick: () => {
                    void onCancel();
                },
                onCancel,
            }}
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormFieldInput name="dispatchDate" label="Date" type="date" />
                <FormFieldInput
                    name="no"
                    label="NO"
                    disabled
                    placeholder="Auto-Generated"
                />
                <FormFieldSelect
                    name="branchId"
                    label="Branch"
                    loadOptions={loadBranches}
                    disabled={!isAdmin && !isHoStaff}
                />
                <FormFieldCategoryOption
                    name="transactionType"
                    label="Txn Type"
                    code={CategoryOptionCodeEnum.Transaction}
                    useValueAsId={true}
                    isCreatable={false}
                />
                <FormFieldInput name="bookNoFrom" label="Book No. From" type="number" />
                <FormFieldInput name="bookNoTo" label="Book No. To" type="number" />
                <div className="md:col-span-2">
                    <FormFieldInput
                        name="vouchersPerBook"
                        label="No Of Voucher Per Book"
                        type="number"
                    />
                </div>
                <FormFieldInput name="mvNoFrom" label="MV No. From" type="number" />
                <FormFieldInput name="mvNoTo" label="MV No. To" disabled />
                {branchId && (
                    <FormFieldSelect
                        key={branchId}
                        name="assignedTo"
                        label="Assigned To"
                        loadOptions={loadAssignedTo}
                    />
                )}
                <FormFieldTextarea name="remarks" label="Remarks" rows={3} />
            </div>
        </Form>
    );
};
