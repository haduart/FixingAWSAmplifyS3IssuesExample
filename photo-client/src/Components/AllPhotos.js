import React, { Component } from "react";
import { graphql } from 'react-apollo';
import { QueryAllPhotos } from "../GraphQL";
import { Auth } from 'aws-amplify';
import AWS from 'aws-sdk';


import { Icon, Table, Button, Loader } from 'semantic-ui-react'

import { Storage } from 'aws-amplify';

class AllPhotos extends Component {


    async handleDownload({ visibility: level, file }) {
        try {
            AWS.config.region = 'eu-west-1';
            const credentials = await Auth.currentCredentials();
            AWS.config.credentials = credentials;
            AWS.config.update({
                region: 'eu-west-1',
                credentials: credentials
            })

            var s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {Bucket: 'photoclient-userfiles-mobilehub-2067999615'}
            });

            var params = {Bucket: file.bucket, Key: file.key};

            s3.getObject(params, function (err, data) {
                if (err) {
                    console.log('FILE NOT FOUND')

                    console.log(err, err.stack);
                } else {
                    console.log('inside getObject')
                    console.log(data);
                    console.log(data.ETag);
                    console.log ('thisis tostring',JSON.stringify(data))
                    var str = data.Body.reduce(function(a,b){ return a+String.fromCharCode(b) },'');
                    var parsedBody = window.btoa(str).replace(/.{76}(?=.)/g,'$&\n');
                    var base64Image = "data:image/jpeg;base64," + parsedBody;
                    console.log("base64Image: ", base64Image)
                } // an error occurred

            });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Table celled={true}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Icon name={'key'} /> PhotoId</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'info'} />Friendly name</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'eye'} />Visibility</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'user'} />Owner</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'calendar'} />Created at</Table.HeaderCell>
                            <Table.HeaderCell> <Icon name={'download'} />Download</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.photos && this.props.photos.items && [].concat(this.props.photos.items).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(photo => (
                            <Table.Row key={photo.id}>
                                <Table.Cell>{photo.file && photo.id}</Table.Cell>
                                <Table.Cell>{photo.name}</Table.Cell>
                                <Table.Cell>{photo.visibility}</Table.Cell>
                                <Table.Cell>{photo.owner}</Table.Cell>
                                <Table.Cell>{photo.file && photo.createdAt}</Table.Cell>
                                <Table.Cell>
                                    {photo.file? <Button icon labelPosition="right" onClick={this.handleDownload.bind(this, photo)}><Icon name="download" />Download</Button> : <Loader inline='centered' active size="tiny" />}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }

}

export default graphql(
    QueryAllPhotos,
    {
        options: {
            fetchPolicy: 'cache-and-network',
        },
        props: ({ data: { listPictures: photos } }) => ({
            photos,
        })
    }
)(AllPhotos);
