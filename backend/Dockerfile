# Use an official Python runtime as the base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 8000

# Define the entry point command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
