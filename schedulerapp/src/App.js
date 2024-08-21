import * as React from 'react';
import './App.css';  // Import the CSS file
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Toolbar,
  DayView,
  MonthView,
  WeekView,
  ViewSwitcher,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  DragDropProvider,
  EditRecurrenceMenu,
  AllDayPanel,
} from '@devexpress/dx-react-scheduler-material-ui';
import { connectProps } from '@devexpress/dx-react-core';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import LocationOn from '@mui/icons-material/LocationOn';
import Notes from '@mui/icons-material/Notes';
import Close from '@mui/icons-material/Close';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Create from '@mui/icons-material/Create';

import { appointments } from './appointments.js';



// React component for a basic Appointment Form Container.
class AppointmentFormContainerBasic extends React.PureComponent {
  constructor(props) {
    super(props);

    // Initialize state with appointmentChanges to track changes made to the appointment.
    this.state = {
      appointmentChanges: {},
    };

    // Retrieve the appointment data passed as a prop.
    this.getAppointmentData = () => {
      const { appointmentData } = this.props;
      return appointmentData;
    };

    // Retrieve the current appointment changes from the state.
    this.getAppointmentChanges = () => {
      const { appointmentChanges } = this.state;
      return appointmentChanges;
    };

    // Bind methods to ensure proper `this` context.
    this.changeAppointment = this.changeAppointment.bind(this);
    this.commitAppointment = this.commitAppointment.bind(this);
  }

  // Method to handle changes in the appointment fields.
  // It updates the state with the new changes.
  changeAppointment({ field, changes }) {
    const nextChanges = {
      ...this.getAppointmentChanges(),
      [field]: changes,
    };
    this.setState({
      appointmentChanges: nextChanges,
    });
  }

  // Method to commit the changes to the appointment.
  // It handles adding, editing, or deleting an appointment based on the `type` parameter.
  commitAppointment(type) {
    const { commitChanges } = this.props;
    const appointment = {
      ...this.getAppointmentData(),
      ...this.getAppointmentChanges(),
    };
    if (type === 'deleted') {
      commitChanges({ [type]: appointment.id });
    } else if (type === 'changed') {
      commitChanges({ [type]: { [appointment.id]: appointment } });
    } else {
      commitChanges({ [type]: appointment });
    }
    // Reset the state after committing changes.
    this.setState({
      appointmentChanges: {},
    });
  }

  // Render method to display the appointment form.
  render() {
    const {
      visible,            // Determines if the form should be visible.
      visibleChange,      // Callback to toggle form visibility.
      appointmentData,    // The current appointment data being edited.
      cancelAppointment,  // Callback to cancel appointment editing.
      target,             // Target element for positioning the form.
      onHide,             // Callback when the form should be hidden.
    } = this.props;
    const { appointmentChanges } = this.state;

    // Combine appointment data with any changes made.
    const displayAppointmentData = {
      ...appointmentData,
      ...appointmentChanges,
    };

    // Determine if this is a new appointment.
    const isNewAppointment = appointmentData.id === undefined;
    const applyChanges = isNewAppointment
      ? () => this.commitAppointment('added')
      : () => this.commitAppointment('changed');

    // Properties for the text editors in the form.
    const textEditorProps = field => ({
      variant: 'outlined',
      onChange: ({ target: change }) => this.changeAppointment({
        field: [field], changes: change.value,
      }),
      value: displayAppointmentData[field] || '',
      label: field[0].toUpperCase() + field.slice(1),
      className: 'Schedule-textField',  // Updated class name
    });

    // Properties for the date pickers in the form.
    const pickerEditorProps = field => ({
      value: displayAppointmentData[field],
      onChange: date => this.changeAppointment({
        field: [field], changes: date ? date.toDate() : new Date(displayAppointmentData[field]),
      }),
      ampm: false,
      inputFormat: 'DD/MM/YYYY HH:mm',
      onError: () => null,
    });

    // Specific properties for the start and end date pickers.
    const startDatePickerProps = pickerEditorProps('startDate');
    const endDatePickerProps = pickerEditorProps('endDate');

    // Cancel changes made to the appointment and reset the form.
    const cancelChanges = () => {
      this.setState({
        appointmentChanges: {},
      });
      visibleChange();
      cancelAppointment();
    };

    return (
      <AppointmentForm.Overlay
        visible={visible}
        target={target}
        fullSize
        onHide={onHide}
      >
        <div className="Schedule-content">
          <div className="Schedule-header">
            <IconButton className="Schedule-closeButton" onClick={cancelChanges} size="large">
              <Close color="action" />
            </IconButton>
          </div>
          <div className="Schedule-content">
            <div className="Schedule-wrapper">
              <Create className="Schedule-icon" color="action" />
              <TextField
                {...textEditorProps('title')}
              />
            </div>
            <div className="Schedule-wrapper">
              <CalendarToday className="Schedule-icon" color="action" />
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DateTimePicker
                  label="Start Date"
                  renderInput={
                    props => <TextField className="Schedule-picker" {...props} />
                  }
                  {...startDatePickerProps}
                />
                <DateTimePicker
                  label="End Date"
                  renderInput={
                    props => <TextField className="Schedule-picker" {...props} />
                  }
                  {...endDatePickerProps}
                />
              </LocalizationProvider>
            </div>
            <div className="Schedule-wrapper">
              <LocationOn className="Schedule-icon" color="action" />
              <TextField
                {...textEditorProps('location')}
              />
            </div>
            <div className="Schedule-wrapper">
              <Notes className="Schedule-icon" color="action" />
              <TextField
                {...textEditorProps('notes')}
                multiline
                rows="6"
              />
            </div>
          </div>
          <div className="Schedule-buttonGroup">
            {!isNewAppointment && (
              <Button
                variant="outlined"
                color="secondary"
                className="Schedule-button"
                onClick={() => {
                  visibleChange();
                  this.commitAppointment('deleted');
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              className="Schedule-button"
              onClick={() => {
                visibleChange();
                applyChanges();
              }}
            >
              {isNewAppointment ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </AppointmentForm.Overlay>
    );
  }
}

// React component to manage the entire schedule, including appointments.
export default class Schedule extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: appointments,             // List of all appointments.
      currentDate: new Date(),        // Current date in the scheduler.
      confirmationVisible: false,     // Visibility of the delete confirmation dialog.
      editingFormVisible: false,      // Visibility of the appointment form.
      deletedAppointmentId: undefined, // ID of the appointment to be deleted.
      editingAppointment: undefined,  // The appointment being edited.
      previousAppointment: undefined, // The previous appointment before editing.
      addedAppointment: {},           // New appointment data to be added.
      startDayHour: 9,                // Start hour of the scheduler day.
      endDayHour: 19,                 // End hour of the scheduler day.
      isNewAppointment: false,        // Whether a new appointment is being created.
    };

    // Bind methods to ensure proper `this` context.
    this.toggleConfirmationVisible = this.toggleConfirmationVisible.bind(this);
    this.commitDeletedAppointment = this.commitDeletedAppointment.bind(this);
    this.toggleEditingFormVisibility = this.toggleEditingFormVisibility.bind(this);

    this.commitChanges = this.commitChanges.bind(this);
    this.onEditingAppointmentChange = this.onEditingAppointmentChange.bind(this);
    this.onAddedAppointmentChange = this.onAddedAppointmentChange.bind(this);

    // Initialize appointment form with connected props.
    this.appointmentForm = connectProps(AppointmentFormContainerBasic, () => {
      const {
        editingFormVisible,
        editingAppointment,
        data,
        addedAppointment,
        isNewAppointment,
        previousAppointment,
      } = this.state;

      // Find the current appointment being edited or the newly added appointment.
      const currentAppointment = data
        .filter(appointment => editingAppointment && appointment.id === editingAppointment.id)[0]
        || addedAppointment;

      // Cancel the current appointment editing, revert to previous state if it's a new appointment.
      const cancelAppointment = () => {
        if (isNewAppointment) {
          this.setState({
            editingAppointment: previousAppointment,
            isNewAppointment: false,
          });
        }
      };

      return {
        visible: editingFormVisible,
        appointmentData: currentAppointment,
        commitChanges: this.commitChanges,
        visibleChange: this.toggleEditingFormVisibility,
        onEditingAppointmentChange: this.onEditingAppointmentChange,
        cancelAppointment,
      };
    });
  }

  // Update the appointment form component whenever the component updates.
  componentDidUpdate() {
    this.appointmentForm.update();
  }

  // Method to handle changes to the currently edited appointment.
  onEditingAppointmentChange(editingAppointment) {
    this.setState({ editingAppointment });
  }

  // Method to handle changes when a new appointment is added.
  onAddedAppointmentChange(addedAppointment) {
    this.setState({ addedAppointment });
    const { editingAppointment } = this.state;
    if (editingAppointment !== undefined) {
      this.setState({
        previousAppointment: editingAppointment,
      });
    }
    this.setState({ editingAppointment: undefined, isNewAppointment: true });
  }

  // Method to set the ID of the appointment to be deleted.
  setDeletedAppointmentId(id) {
    this.setState({ deletedAppointmentId: id });
  }

  // Toggle the visibility of the appointment editing form.
  toggleEditingFormVisibility() {
    const { editingFormVisible } = this.state;
    this.setState({
      editingFormVisible: !editingFormVisible,
    });
  }

  // Toggle the visibility of the delete confirmation dialog.
  toggleConfirmationVisible() {
    const { confirmationVisible } = this.state;
    this.setState({ confirmationVisible: !confirmationVisible });
  }

  // Method to commit the deletion of an appointment.
  commitDeletedAppointment() {
    this.setState((state) => {
      const { data, deletedAppointmentId } = state;
      const nextData = data.filter(appointment => appointment.id !== deletedAppointmentId);

      return { data: nextData, deletedAppointmentId: null };
    });
    this.toggleConfirmationVisible();
  }

  // Method to commit changes (add, update, delete) to the appointments.
  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map(appointment => (
          changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
      }
      if (deleted !== undefined) {
        this.setDeletedAppointmentId(deleted);
        this.toggleConfirmationVisible();
      }
      return { data, addedAppointment: {} };
    });
  }

  // Render method to display the scheduler and related components.
  render() {
    const {
      currentDate,
      data,
      confirmationVisible,
      editingFormVisible,
      startDayHour,
      endDayHour,
    } = this.state;

    return (
      <Paper>
        <Scheduler
          data={data}
          height={660}
        >
          <ViewState
            currentDate={currentDate}
          />
          <EditingState
            onCommitChanges={this.commitChanges}
            onEditingAppointmentChange={this.onEditingAppointmentChange}
            onAddedAppointmentChange={this.onAddedAppointmentChange}
          />
          <DayView
            startDayHour={startDayHour}
            endDayHour={endDayHour}
          />
          <WeekView
            startDayHour={startDayHour}
            endDayHour={endDayHour}
          />
          <MonthView />
          <AllDayPanel />
          <EditRecurrenceMenu />
          <Appointments />
          <AppointmentTooltip
            showOpenButton
            showCloseButton
            showDeleteButton
          />
          <Toolbar />
          <ViewSwitcher />
          <AppointmentForm
            overlayComponent={this.appointmentForm}
            visible={editingFormVisible}
            onVisibilityChange={this.toggleEditingFormVisibility}
          />
          <DragDropProvider />
        </Scheduler>

        <Dialog
          open={confirmationVisible}
          onClose={this.toggleConfirmationVisible}
        >
          <DialogTitle>
            Delete Appointment
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this appointment?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.toggleConfirmationVisible} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={this.commitDeletedAppointment} color="secondary" variant="outlined">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Fab
          color="secondary"
          className="Schedule-addButton"  // Updated class name
          onClick={() => {
            this.setState({ editingFormVisible: true });
            this.onEditingAppointmentChange(undefined);
            this.onAddedAppointmentChange({
              startDate: new Date(currentDate).setHours(startDayHour),
              endDate: new Date(currentDate).setHours(startDayHour + 1),
            });
          }}
        >
          <AddIcon />
        </Fab>
      </Paper>
    );
  }
}

